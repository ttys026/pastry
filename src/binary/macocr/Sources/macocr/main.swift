import Cocoa
import Vision

let MODE = VNRequestTextRecognitionLevel.accurate
let USE_LANG_CORRECTION = false
let LANGUAGE = ["zh-Hans", "en-US"]
var REVISION:Int
if #available(macOS 11, *) {
    REVISION = VNRecognizeTextRequestRevision2
} else {
    REVISION = VNRecognizeTextRequestRevision1
}

func main(args: [String]) -> Int32 {
    guard CommandLine.arguments.count == 2 else {
        fputs(String(format: "usage: %1$@ image\n", CommandLine.arguments[0]), stderr)
        return 1
    }

    let src = args[1]

    guard let img = NSImage(byReferencingFile: src) else {
        fputs("Error: failed to load image '\(src)'\n", stderr)
        return 1
    }

    guard let imgRef = img.cgImage(forProposedRect: &img.alignmentRect, context: nil, hints: nil) else {
        fputs("Error: failed to convert NSImage to CGImage for '\(src)'\n", stderr)
        return 1
    }


    let request = VNRecognizeTextRequest { (request, error) in
        let observations = request.results as? [VNRecognizedTextObservation] ?? []
        let obs : [String] = observations.map { $0.topCandidates(1).first?.string ?? ""}
        print(obs.joined(separator: "\n"))
    }
    request.recognitionLevel = MODE
    request.recognitionLanguages = LANGUAGE
    request.usesLanguageCorrection = USE_LANG_CORRECTION
    request.revision = REVISION

    try? VNImageRequestHandler(cgImage: imgRef, options: [:]).perform([request])

    return 0
}
exit(main(args: CommandLine.arguments))
