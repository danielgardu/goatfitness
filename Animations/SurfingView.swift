import SwiftUI
import Foundation

struct SurfingView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 0.82
    var isGoatMode: Bool = false

    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate * speed
                self.drawSurfing(in: &context, size: size, time: t)
            }
        }
    }
    
    private func drawSurfing(in context: inout GraphicsContext, size: CGSize, time t: Double) {
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let scale = min(size.width, size.height) * 0.47

        let phase = CGFloat(t * .pi * 2)
        let surferColor: Color = colorMode == .darkStickman ? .black : .white
        let boardColor = surferColor.opacity(0.95)

        func lerp(_ a: CGFloat, _ b: CGFloat, _ t: CGFloat) -> CGFloat {
            a + (b - a) * t
        }
        func lerp(_ a: CGPoint, _ b: CGPoint, _ t: CGFloat) -> CGPoint {
            CGPoint(x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t))
        }
        func clamp01(_ x: CGFloat) -> CGFloat {
            min(1, max(0, x))
        }

        let diagonal = sin(phase * 0.84)
        let rebound = sin(phase * 1.68 + 0.5) * scale * 0.010
        let boardCenter = CGPoint(
            x: center.x + diagonal * scale * 0.065,
            y: center.y + scale * 0.35 - diagonal * scale * 0.075 + rebound
        )

        let boardPitch = sin(phase * 0.84 + 0.35) * 0.14
        let boardRoll = sin(phase * 1.68 - 0.4) * 0.022
        let boardAngle = boardPitch + boardRoll

        func world(_ local: CGPoint) -> CGPoint {
            let c = cos(boardAngle)
            let s = sin(boardAngle)
            return CGPoint(
                x: boardCenter.x + local.x * c - local.y * s,
                y: boardCenter.y + local.x * s + local.y * c
            )
        }

        let surfaceY = center.y + scale * 0.78 + diagonal * scale * 0.014
        let shadowWidth = scale * 0.95 - diagonal * scale * 0.08
        let shadowRect = CGRect(
            x: boardCenter.x - shadowWidth / 2,
            y: surfaceY + scale * 0.03,
            width: shadowWidth,
            height: scale * 0.06
        )
        context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(0.20)))

        let boardHalf = scale * 0.40
        var boardPath = Path()
        boardPath.move(to: world(CGPoint(x: -boardHalf * 0.98, y: -scale * 0.035)))
        boardPath.addQuadCurve(
            to: world(CGPoint(x: boardHalf * 0.98, y: -scale * 0.035)),
            control: world(CGPoint(x: 0, y: scale * 0.11))
        )
        context.stroke(
            boardPath,
            with: .color(boardColor),
            style: StrokeStyle(lineWidth: max(6.5, scale * 0.045), lineCap: .round, lineJoin: .round)
        )

        var tailFin = Path()
        tailFin.move(to: world(CGPoint(x: -boardHalf * 0.68, y: scale * 0.006)))
        tailFin.addLine(to: world(CGPoint(x: -boardHalf * 0.88, y: scale * 0.075)))
        tailFin.move(to: world(CGPoint(x: -boardHalf * 0.70, y: scale * 0.006)))
        tailFin.addLine(to: world(CGPoint(x: -boardHalf * 0.62, y: scale * 0.080)))
        context.stroke(
            tailFin,
            with: .color(boardColor.opacity(0.88)),
            style: StrokeStyle(lineWidth: max(3.0, scale * 0.020), lineCap: .round, lineJoin: .round)
        )

        let crouch = (sin(phase * 1.68 - 0.55) * 0.5 + 0.5)
        let crouchMix = clamp01(crouch)
        let boardDownFactor = clamp01((-diagonal + 1) * 0.5)
        let armLift = boardDownFactor * scale * 0.050

        let hipsLow = CGPoint(x: -scale * 0.02, y: -scale * 0.42)
        let hipsHigh = CGPoint(x: scale * 0.01, y: -scale * 0.48)
        let hips = lerp(hipsLow, hipsHigh, crouchMix)

        let torsoLength = scale * 0.47
        let torsoLean = CGFloat(0.12) + sin(phase * 0.84 + 0.4) * 0.045
        let shoulders = CGPoint(
            x: hips.x + sin(torsoLean) * torsoLength,
            y: hips.y - cos(torsoLean) * torsoLength
        )

        let headRadius = scale * 0.13
        let headCenter = CGPoint(
            x: shoulders.x + scale * 0.05,
            y: shoulders.y - headRadius * 1.32 - sin(phase * 1.68) * scale * 0.004
        )

        let rearFoot = CGPoint(
            x: -boardHalf * 0.20 - sin(phase * 0.84) * scale * 0.018,
            y: -scale * 0.045
        )
        let frontFoot = CGPoint(
            x: boardHalf * 0.28 + sin(phase * 0.84 + 0.8) * scale * 0.016,
            y: -scale * 0.050
        )

        let rearKnee = CGPoint(
            x: hips.x - scale * 0.04 + sin(phase * 1.68) * scale * 0.012,
            y: hips.y + scale * 0.23 - crouchMix * scale * 0.022
        )
        let frontKnee = CGPoint(
            x: hips.x + scale * 0.15 + sin(phase * 1.68 + 0.8) * scale * 0.011,
            y: hips.y + scale * 0.23 - crouchMix * scale * 0.026
        )

        let rearElbow = CGPoint(
            x: shoulders.x - scale * 0.15 + sin(phase * 1.68 + .pi) * scale * 0.015,
            y: shoulders.y + scale * 0.06 - armLift * 0.62
        )
        let rearHand = CGPoint(
            x: shoulders.x - scale * 0.10 + sin(phase * 1.68 + .pi) * scale * 0.010,
            y: shoulders.y - scale * 0.12 - armLift
        )

        let frontElbow = CGPoint(
            x: shoulders.x + scale * 0.12 + sin(phase * 1.68) * scale * 0.018,
            y: shoulders.y + scale * 0.13 - armLift * 0.66
        )
        let frontHand = CGPoint(
            x: shoulders.x + scale * 0.29 + sin(phase * 1.68) * scale * 0.018,
            y: shoulders.y + scale * 0.14 - armLift
        )

        let torsoWidth = max(15.0, scale * 0.105)
        let legWidth = max(12.0, scale * 0.080)
        let armWidth = max(10.0, scale * 0.070)

        func drawChain(_ points: [CGPoint], width: CGFloat, color: Color) {
            guard let first = points.first else { return }
            var path = Path()
            path.move(to: world(first))
            for p in points.dropFirst() {
                path.addLine(to: world(p))
            }
            context.stroke(
                path,
                with: .color(color),
                style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round)
            )
        }

        drawChain([shoulders, rearElbow, rearHand], width: armWidth, color: surferColor.opacity(0.50))
        drawChain([hips, rearKnee, rearFoot], width: legWidth, color: surferColor.opacity(0.54))

        drawChain([shoulders, hips], width: torsoWidth, color: surferColor)
        
        let headWorld = world(headCenter)
        // Head (Goat Mode Support - Surfing uses cara1.png)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara1_negro" : "cara1"))
            let imgSize = headRadius * 4.76
            let rect = CGRect(
                x: headWorld.x - imgSize/2,
                y: headWorld.y - imgSize/2 - (headRadius * 0.14),
                width: imgSize,
                height: imgSize
            )
            context.draw(headImage, in: rect)
        } else {
            context.fill(Path(ellipseIn: CGRect(x: headWorld.x - headRadius, y: headWorld.y - headRadius, width: headRadius * 2, height: headRadius * 2)), with: .color(surferColor))
        }

        drawChain([hips, frontKnee, frontFoot], width: legWidth, color: surferColor)
        drawChain([shoulders, frontElbow, frontHand], width: armWidth, color: surferColor)
    }
}

#Preview {
    ZStack {
        Color(white: 0.07).ignoresSafeArea()
        SurfingView()
            .frame(width: 340, height: 340)
    }
}
