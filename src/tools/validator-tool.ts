import { z } from "zod";
import { grokStructuredOutput, isGrokEnabled } from "@/lib/grok";
import type { ValidationResult } from "@/types/pipeline";

const TAILWIND_PATTERN =
  /\b(flex|grid|gap-|p-|m-|text-|bg-|border|rounded|font-|min-h|md:|lg:|hidden|block|inline)\b/;

const GrokValidationSchema = z.object({
  valid: z.boolean(),
  errors: z.array(z.string()),
  correctedFiles: z.record(z.string()).optional(),
});

function validateJsxSyntax(code: string, filePath: string): string[] {
  const errors: string[] = [];
  const openTags = (code.match(/<[A-Z][A-Za-z0-9]*/g) ?? []).length;
  const closeTags = (code.match(/<\/[A-Z][A-Za-z0-9]*>/g) ?? []).length;
  const selfClosing = (code.match(/\/>/g) ?? []).length;

  if (code.includes("className=") && !TAILWIND_PATTERN.test(code)) {
    errors.push(`${filePath}: className present but no recognizable Tailwind utilities`);
  }

  const openBraces = (code.match(/\{/g) ?? []).length;
  const closeBraces = (code.match(/\}/g) ?? []).length;
  if (openBraces !== closeBraces) {
    errors.push(`${filePath}: mismatched JSX braces`);
  }

  if (openTags > closeTags + selfClosing && !code.includes("export")) {
    errors.push(`${filePath}: possible unclosed JSX elements`);
  }

  if (code.includes('""') || code.includes("''")) {
    errors.push(`${filePath}: empty string literal in JSX attribute`);
  }

  return errors;
}

function autoFix(code: string): string {
  let fixed = code;
  fixed = fixed.replace(/className=""/g, 'className="text-slate-300"');
  fixed = fixed.replace(/className=''/g, "className='text-slate-300'");
  if (!fixed.includes("export ")) {
    fixed = `export default function FixedComponent() {\n  return null;\n}\n${fixed}`;
  }
  return fixed;
}

function localValidateJsx(files: Record<string, string>): ValidationResult {
  const errors: string[] = [];
  const correctedFiles: Record<string, string> = {};

  for (const [path, content] of Object.entries(files)) {
    if (!path.endsWith(".tsx") && !path.endsWith(".jsx")) continue;
    errors.push(...validateJsxSyntax(content, path));
    correctedFiles[path] = autoFix(content);
  }

  return {
    valid: errors.length === 0,
    errors,
    correctedFiles: errors.length ? correctedFiles : undefined,
  };
}

async function grokValidateAndFix(
  files: Record<string, string>,
  localErrors: string[],
): Promise<ValidationResult> {
  const tsxFiles = Object.fromEntries(
    Object.entries(files).filter(([p]) => p.endsWith(".tsx") || p.endsWith(".jsx")),
  );

  const result = await grokStructuredOutput(
    GrokValidationSchema,
    `You are a React/TypeScript code reviewer. Validate and fix these maritime dashboard TSX files.

Local validator reported:
${localErrors.join("\n") || "No local errors"}

Files (path → source):
${JSON.stringify(tsxFiles, null, 0).slice(0, 12000)}

Return valid=true only if all files are correct TSX with balanced braces and sensible Tailwind classNames.
If fixes are needed, return correctedFiles with the full fixed source for each changed path.`,
  );

  const corrected = result.correctedFiles
    ? Object.fromEntries(
        Object.entries(result.correctedFiles).filter(
          ([p]) => p.endsWith(".tsx") || p.endsWith(".jsx"),
        ),
      )
    : undefined;

  if (corrected && Object.keys(corrected).length > 0) {
    const merged = { ...files, ...corrected };
    const recheck = localValidateJsx(merged);
    return {
      valid: recheck.valid,
      errors: recheck.valid ? [] : recheck.errors,
      correctedFiles: recheck.valid ? corrected : recheck.correctedFiles,
    };
  }

  return {
    valid: result.valid,
    errors: result.errors,
    correctedFiles: corrected,
  };
}

export async function validateJsx(files: Record<string, string>): Promise<ValidationResult> {
  const local = localValidateJsx(files);

  if (local.valid) {
    return local;
  }

  if (!isGrokEnabled()) {
    return local;
  }

  try {
    return await grokValidateAndFix(files, local.errors);
  } catch {
    return local;
  }
}
