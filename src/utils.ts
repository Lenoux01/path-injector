import { EXCLUDED_EXTENSIONS, SUPPORTED_LANGUAGES } from "./constants";

export function isFileExcluded(
  fileName: string,
  fileExtension: string
): boolean {
  return EXCLUDED_EXTENSIONS.some(
    (ext) => fileName.endsWith(ext) || fileExtension === ext
  );
}

export function isSupportedLanguage(languageId: string): boolean {
  return SUPPORTED_LANGUAGES.includes(languageId);
}
