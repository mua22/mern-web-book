# Exports a .pptx deck to .pdf (one slide per page, full LAYOUT_WIDE
# 13.333x7.5in per page) via PowerPoint COM automation. Requires PowerPoint
# to be installed and pywin32 (pip install pywin32).
#
# Usage:
#   python tools/pptx_to_pdf.py <in.pptx> <out.pdf>
#
# Used after every deck regeneration to override the PDF served from
# docs/downloads/lecture-slides/ -- see slides/generators/lecture-NN.js for
# the deck source and deckBuilder.js for the shared slide layouts.

import sys
import os
import win32com.client

PP_SAVE_AS_PDF = 32


def convert(pptx_path, pdf_path):
    pptx_path = os.path.abspath(pptx_path)
    pdf_path = os.path.abspath(pdf_path)
    powerpoint = win32com.client.Dispatch("PowerPoint.Application")
    powerpoint.Visible = 1
    deck = powerpoint.Presentations.Open(pptx_path, WithWindow=False)
    try:
        deck.SaveAs(pdf_path, PP_SAVE_AS_PDF)
    finally:
        deck.Close()
        powerpoint.Quit()
    print(f"WROTE {pdf_path}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python tools/pptx_to_pdf.py <in.pptx> <out.pdf>")
        sys.exit(1)
    convert(sys.argv[1], sys.argv[2])
