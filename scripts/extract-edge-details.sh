#!/usr/bin/env bash
# Extract all `to` edge details from content markdown files for quality review.
#
# Prints each detail with its source file so narrator-voice patterns are easy
# to spot and trace back to the right file for fixing.
#
# Usage:
#   ./scripts/extract-edge-details.sh                  # all zones
#   ./scripts/extract-edge-details.sh content/kubernetes  # single zone
#
# Output format:
#   content/zone/file.md|"detail text..."
#
# What to look for (narrator-voice patterns to fix):
#   - Starts with "You know...", "You have...", "Your ..."
#   - Starts with "A [noun] is...", "The [noun] does..."
#   - Explains the next node's content instead of deepening the user's question
#   - Written as third-person explanation rather than user thinking aloud
#
# Good detail: first-person, expresses confusion/pain, never starts answering
# Bad detail:  narrator recapping, explaining the solution, or framing the lesson

TARGET="${1:-content}"

find "$TARGET" -name "*.md" | sort | xargs awk '
  FNR==1 { in_front=1; in_to=0 }
  FNR>1 && /^---/ { in_front=0 }
  in_front==0 { next }
  /^  to:/ { in_to=1; next }
  /^  from:/ { in_to=0; next }
  in_to && /detail:/ { gsub(/      detail: /, ""); print FILENAME "|" $0 }
'
