#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DEFAULT_INPUT_DIR="${REPO_ROOT}/current_documentation/guidebook/assets/video"
DEFAULT_OUTPUT_DIR="${REPO_ROOT}/current_documentation/guidebook/assets/gifs"

input_dir="${DEFAULT_INPUT_DIR}"
output_dir="${DEFAULT_OUTPUT_DIR}"
fps="12"
width="960"
force="false"
match_pattern="*"

usage() {
  cat <<EOF
Usage: $(basename "$0") [options]

Convert videos from the guidebook assets/video folder into GIFs in assets/gifs.

Options:
  --input DIR      Source video directory. Default: ${DEFAULT_INPUT_DIR}
  --output DIR     Output GIF directory. Default: ${DEFAULT_OUTPUT_DIR}
  --fps N          GIF frame rate. Default: ${fps}
  --width PX       Max GIF width in pixels. Default: ${width}
  --match GLOB     Only convert files whose basename matches the glob. Default: ${match_pattern}
  --force          Overwrite existing GIFs.
  --help           Show this help text.

Examples:
  $(basename "$0")
  $(basename "$0") --match 'authoring-loading*'
  $(basename "$0") --fps 10 --width 720 --force
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --input)
      input_dir="$2"
      shift 2
      ;;
    --output)
      output_dir="$2"
      shift 2
      ;;
    --fps)
      fps="$2"
      shift 2
      ;;
    --width)
      width="$2"
      shift 2
      ;;
    --match)
      match_pattern="$2"
      shift 2
      ;;
    --force)
      force="true"
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required but was not found in PATH." >&2
  exit 1
fi

if [[ ! -d "${input_dir}" ]]; then
  echo "Input directory does not exist: ${input_dir}" >&2
  exit 1
fi

if [[ ! "${fps}" =~ ^[0-9]+([.][0-9]+)?$ ]]; then
  echo "--fps must be a positive number." >&2
  exit 1
fi

if [[ ! "${width}" =~ ^[1-9][0-9]*$ ]]; then
  echo "--width must be a positive integer." >&2
  exit 1
fi

mkdir -p "${output_dir}"

mapfile -t video_files < <(
  find "${input_dir}" -maxdepth 1 -type f \
    \( -iname '*.mp4' -o -iname '*.mov' -o -iname '*.m4v' -o -iname '*.webm' -o -iname '*.mkv' \) \
    | sort
)

if [[ ${#video_files[@]} -eq 0 ]]; then
  echo "No video files found in ${input_dir}" >&2
  exit 1
fi

converted=0
skipped=0

convert_video() {
  local video_path="$1"
  local basename_with_ext
  local basename_no_ext
  local output_path
  local palette_file
  local scale_filter

  basename_with_ext="$(basename "${video_path}")"
  basename_no_ext="${basename_with_ext%.*}"

  if [[ ! "${basename_no_ext}" == ${match_pattern} ]]; then
    return 2
  fi

  output_path="${output_dir}/${basename_no_ext}.gif"

  if [[ -f "${output_path}" && "${force}" != "true" ]]; then
    echo "Skipping existing GIF: ${output_path}"
    skipped=$((skipped + 1))
    return 0
  fi

  palette_file="$(mktemp "${TMPDIR:-/tmp}/vizij-gif-palette.XXXXXX.png")"
  cleanup_palette() {
    rm -f "${palette_file}"
  }
  trap cleanup_palette RETURN

  echo "Converting ${basename_with_ext} -> $(basename "${output_path}")"

  scale_filter="fps=${fps},scale='min(${width},iw)':-1:flags=lanczos"

  ffmpeg -hide_banner -loglevel error -y \
    -i "${video_path}" \
    -vf "${scale_filter},palettegen=stats_mode=diff" \
    "${palette_file}"

  ffmpeg -hide_banner -loglevel error -y \
    -i "${video_path}" \
    -i "${palette_file}" \
    -lavfi "${scale_filter}[video];[video][1:v]paletteuse=dither=sierra2_4a" \
    "${output_path}"

  rm -f "${palette_file}"
  trap - RETURN

  converted=$((converted + 1))
}

for video_path in "${video_files[@]}"; do
  if convert_video "${video_path}"; then
    :
  else
    status=$?
    if [[ ${status} -ne 2 ]]; then
      exit "${status}"
    fi
  fi
done

if [[ ${converted} -eq 0 && ${skipped} -eq 0 ]]; then
  echo "No videos matched --match ${match_pattern}" >&2
  exit 1
fi

echo "Done. Converted: ${converted}. Skipped: ${skipped}. Output: ${output_dir}"
