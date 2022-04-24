# three-pixel-font
A pixel font mesh/material

<img width="1045" alt="Screen Shot 2022-04-24 at 12 35 38 PM" src="https://user-images.githubusercontent.com/453513/164993438-d9dbec94-c085-4f63-8436-54ad8ec65f85.png">


This pixel-font rendering toolkit takes a glyph texture, and a couple simple text files for configuration. 
It uses pixel-columns as a basis for rendering text with variable width, and supports one layer of overlap, on characters that need to share space.

# example #

```
      const textMesh = new PixelTextMesh("Hello World.", {
        fontFace: pixelFontFaces.cdogs_font_7x8,
        color: new Color(1, 1, 1),
        letterSpacing: -1,
        strokeColor: new Color(0, 0, 0),
        scaleDownToPhysicalSize: true,
        screenSpace: false,
        constantSizeOnScreen: false
      }, undefined, (w, h) => {
        book.scale.x = 0.01 * w
        book.scale.y = 0.01 * h
      })
      this.scene.add(textMesh)
```

# Approach and History #
Originally it was a very simple approach to pixel font rendering:

A block of text would be comprised of a font glyph texture, and a layout texture.
The layout texture was a single-channel 8bit texture where each pixel's value was literally the glyph index.

This was great for fixed-width fonts, but legibility suffered.

The algorithm was extended to treat every pixel of width of a character as a distinct lookup. 
Fonts are still fixed-height, but each pixel column of text is no longer locked to a glyph grid.

The layout texture grew significantly to accomidate this. 
A single character used to be 1 8bit value, but now a single character needs a glyph index and a pixel offset for each column of pixels. 

A 7 pixel wide glyph now needed 7 * 2 * 8bit of data on the layout texture. 
For WebGL 1.0 compatibility reasons, the layout texture was made 4-channel, not the minimal 2-channel needed.

Inspired by fonts like C-Dogs by Ronny Wester, outlines in the font actually look best when they are overlapping (maximum).

The final upgrade to the algorithm was to use the final unused 2 channels of the layout texture's 4 channels, to provide an alternate glyph column.

Every column of the final text can sample two different glyph columns and max them.

# Limitations #

Boundaries between pixels in the final render tend to resolve to the incorrect neighbour, creating pixel-thin artifacts.

The font data, and the loading thereof, is very opinionated, and subject to change. Right now, the font faces are hard-coded in the library (CDogs 7x8 only), but it's designed to only load upon usage.

