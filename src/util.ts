
export type RGBA = [number, number, number, number];

export function getRGBA(imgData: ImageData, x: number, y: number): RGBA {
    const i = y * imgData.width * 4 + x * 4
    return [imgData.data[i], imgData.data[i + 1], imgData.data[i + 2], imgData.data[i + 3]]
}

export function posToIndex(width: number, stride: number = 4): (x: number, y: number) => number {
    return (x, y) => y * width * stride + x * stride
}

export function getContrastMap(imgData: ImageData, upperThresh: number, lowerThresh: number) {
    const contrastMap = new ImageData(imgData.width, imgData.height)
    for (let i = 0; i < imgData.data.length; i += 4) {
        const r = imgData.data[i];
        const g = imgData.data[i + 1];
        const b = imgData.data[i + 2];
        const rawBrightness = r * 0.299 + g * 0.587 + b * 0.114
        // normalized
        const brightness = rawBrightness / 255
        if (brightness > upperThresh || brightness < lowerThresh) {
            contrastMap.data[i] = 0
            contrastMap.data[i + 1] = 0
            contrastMap.data[i + 2] = 0
            contrastMap.data[i + 3] = 255
        } else {
            contrastMap.data[i] = 255
            contrastMap.data[i + 1] = 255
            contrastMap.data[i + 2] = 255
            contrastMap.data[i + 3] = 255
        }
    }
    return contrastMap
}

export function sortByHue(a: RGBA, b: RGBA) {
    const hueA = getHue(a)
    const hueB = getHue(b)
    return hueB - hueA
}

export function sortByBrightness(a: RGBA, b: RGBA) {
    const brightnessA = getBrightness(a)
    const brightnessB = getBrightness(b)
    return brightnessB - brightnessA
}

export function getHue(rgba: RGBA) {
    const r = rgba[0] / 255
    const g = rgba[1] / 255
    const b = rgba[2] / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min
    let h
    if (d === 0) {
        h = 0
    } else if (max === r) {
        h = (g - b) / d + (g < b ? 6 : 0)
    } else if (max === g) {
        h = (b - r) / d + 2
    } else {
        h = (r - g) / d + 4
    }
    return h * 60
}


export function getBrightness(rgba: RGBA) {
    return rgba[0] * 0.299 + rgba[1] * 0.587 + rgba[2] * 0.114
}

export function equal(a: RGBA, b: RGBA) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3]
}

export function getSpans(imgData: ImageData): number[][][] {
    const spans = []
    // Iterate over each row of the image
    for (let y = 0; y < imgData.height; y++) {
        // Iterate over each pixel in the row
        const xspans = []
        let currentPixel = getRGBA(imgData, 0, y)
        let i = 0

        for (let x = 0; x < imgData.width; x++) {
            // Get the RGBA values for the pixel
            const nextPixel = getRGBA(imgData, x, y)
            if (!equal(currentPixel, nextPixel)) {
                xspans.push([i, x])
                i = x
                currentPixel = nextPixel
            }
        }

        spans.push(xspans)
    }
    return spans
}

export function sortSpansInImage(srcImg: ImageData, spans: number[][][]) {
    const imgData = new ImageData(Uint8ClampedArray.from(srcImg.data), srcImg.width, srcImg.height, { colorSpace: srcImg.colorSpace })
    imgData.data.set([...srcImg.data])

    const index = posToIndex(imgData.width)
    spans.forEach((xspans, y) => {
        xspans.forEach(([from, to]) => {
            const pixelGroup = []
            for (let x = from; x < to; x++) {
                pixelGroup.push(getRGBA(imgData, x, y))
            }
            pixelGroup.sort(sortByHue)
            const fi = index(from, y)
            imgData.data.set(pixelGroup.flat(), fi)
        })
    })
    return imgData
}