import SwiftUI
import Foundation

struct SkateboardView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 1.0
    private let jumpCycle: Double = 3.0
    private let jumpWindow: CGFloat = 0.30
    var isGoatMode: Bool = false

    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate * speed
                self.drawSkateboard(in: &context, size: size, time: t)
            }
        }
        .preferredColorScheme(.dark)
    }
    
    private func drawSkateboard(in context: inout GraphicsContext, size: CGSize, time t: Double) {
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let scale = min(size.width, size.height) * 0.46

        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        let boardColor = Color(colorMode == .darkStickman ? Color.black : Color.white).opacity(0.95)
        let wheelColor = Color(colorMode == .darkStickman ? Color.black : Color.white).opacity(0.9)
        let wheelCoreColor = Color.black.opacity(0.35)
        let groundColor = Color(colorMode == .darkStickman ? Color.black : Color.white).opacity(0.18)

        func lerp(_ a: CGFloat, _ b: CGFloat, _ t: CGFloat) -> CGFloat {
            a + (b - a) * t
        }
        func smoothStep(_ x: CGFloat) -> CGFloat {
            let c = min(1, max(0, x))
            return c * c * (3 - 2 * c)
        }

        // Jump pulse every ~3 seconds, smooth in and out.
        let jumpPhase = CGFloat((t / jumpCycle).truncatingRemainder(dividingBy: 1.0))
        let jumpPulse: CGFloat
        let preCompression: CGFloat
        let jumpProgress: CGFloat
        if jumpPhase < jumpWindow {
            let p = jumpPhase / jumpWindow
            jumpProgress = p
            jumpPulse = sin(p * .pi)
            let preloadWindow: CGFloat = 0.18
            if p < preloadWindow {
                preCompression = sin((p / preloadWindow) * .pi)
            } else {
                preCompression = 0
            }
        } else {
            jumpProgress = 0
            jumpPulse = 0
            preCompression = 0
        }

        let groundY = center.y + scale * 0.83
        let deckHalf = scale * 0.42
        let deckThickness = scale * 0.055
        let wheelRadius = scale * 0.05
        let wheelLocalY = scale * 0.066

        let jumpLift = jumpPulse * scale * 0.118 - preCompression * scale * 0.018

        let jumpRotation: CGFloat
        if jumpPhase < jumpWindow {
            let p = jumpProgress
            let ccw = -CGFloat.pi / 36
            let cw = CGFloat.pi / 36
            if p < 0.28 {
                jumpRotation = lerp(0, ccw, smoothStep(p / 0.28))
            } else if p < 0.56 {
                jumpRotation = lerp(ccw, 0, smoothStep((p - 0.28) / 0.28))
            } else if p < 0.82 {
                jumpRotation = lerp(0, cw, smoothStep((p - 0.56) / 0.26))
            } else {
                jumpRotation = lerp(cw, 0, smoothStep((p - 0.82) / 0.18))
            }
        } else {
            jumpRotation = 0
        }
        let limbSpread = jumpPulse * scale * 0.08

        let deckCenter = CGPoint(
            x: center.x + scale * 0.01,
            y: groundY - wheelLocalY - wheelRadius - jumpLift
        )

        let floorSpeed = CGFloat(t) * scale * 2.7
        let laneSpan = deckHalf * 2.65
        let laneMinX = deckCenter.x - laneSpan * 0.5
        let laneMaxX = deckCenter.x + laneSpan * 0.5
        let baseDashLength = scale * 0.17
        let baseDashGap = scale * 0.22

        func drawMovingGroundLane(
            y: CGFloat,
            phaseShift: CGFloat,
            opacity: CGFloat,
            dashScale: CGFloat,
            thickness: CGFloat
        ) {
            let dashLength = baseDashLength * dashScale
            let stride = dashLength + baseDashGap
            let offset = (floorSpeed + phaseShift).truncatingRemainder(dividingBy: stride)
            let count = Int(ceil((laneSpan + stride * 2) / stride))

            for i in 0...count {
                let start = laneMinX - stride + CGFloat(i) * stride - offset
                let end = start + dashLength
                let visibleStart = max(start, laneMinX)
                let visibleEnd = min(end, laneMaxX)
                if visibleEnd > visibleStart {
                    var lane = Path()
                    lane.move(to: CGPoint(x: visibleStart, y: y))
                    lane.addLine(to: CGPoint(x: visibleEnd, y: y))
                    context.stroke(
                        lane,
                        with: .color(groundColor.opacity(opacity)),
                        style: StrokeStyle(
                            lineWidth: max(2.0, scale * thickness),
                            lineCap: .round
                        )
                    )
                }
            }
        }

        drawMovingGroundLane(
            y: groundY + scale * 0.06,
            phaseShift: 0,
            opacity: 1.0,
            dashScale: 1.0,
            thickness: 0.0145
        )
        drawMovingGroundLane(
            y: groundY + scale * 0.12,
            phaseShift: (baseDashLength + baseDashGap) * 0.55,
            opacity: 0.62,
            dashScale: 0.76,
            thickness: 0.012
        )

        func world(_ local: CGPoint) -> CGPoint {
            let c = cos(jumpRotation)
            let s = sin(jumpRotation)
            return CGPoint(
                x: deckCenter.x + local.x * c - local.y * s,
                y: deckCenter.y + local.x * s + local.y * c
            )
        }

        let shadowWidth = deckHalf * 2.05 - jumpPulse * scale * 0.18
        let shadowRect = CGRect(
            x: deckCenter.x - shadowWidth / 2,
            y: groundY + scale * 0.03,
            width: shadowWidth,
            height: scale * 0.08
        )
        context.fill(
            Path(ellipseIn: shadowRect),
            with: .color(.black.opacity(0.24 - jumpPulse * 0.08))
        )

        var deckPath = Path()
        deckPath.move(to: world(CGPoint(x: -deckHalf * 0.96, y: -deckThickness * 0.08)))
        deckPath.addQuadCurve(
            to: world(CGPoint(x: -deckHalf * 0.67, y: deckThickness * 0.06)),
            control: world(CGPoint(x: -deckHalf * 0.84, y: deckThickness * 0.22))
        )
        deckPath.addQuadCurve(
            to: world(CGPoint(x: deckHalf * 0.67, y: deckThickness * 0.06)),
            control: world(CGPoint(x: 0, y: deckThickness * 0.72))
        )
        deckPath.addQuadCurve(
            to: world(CGPoint(x: deckHalf * 0.96, y: -deckThickness * 0.08)),
            control: world(CGPoint(x: deckHalf * 0.84, y: deckThickness * 0.22))
        )
        context.stroke(
            deckPath,
            with: .color(boardColor),
            style: StrokeStyle(
                lineWidth: max(8, scale * 0.06),
                lineCap: .round,
                lineJoin: .round
            )
        )

        let rearWheelCenterLocal = CGPoint(x: -deckHalf * 0.43, y: wheelLocalY)
        let frontWheelCenterLocal = CGPoint(x: deckHalf * 0.41, y: wheelLocalY)
        let rearTruckTop = CGPoint(x: rearWheelCenterLocal.x, y: deckThickness * 0.16)
        let frontTruckTop = CGPoint(x: frontWheelCenterLocal.x, y: deckThickness * 0.16)

        var trucks = Path()
        trucks.move(to: world(rearTruckTop))
        trucks.addLine(to: world(rearWheelCenterLocal))
        trucks.move(to: world(frontTruckTop))
        trucks.addLine(to: world(frontWheelCenterLocal))
        context.stroke(
            trucks,
            with: .color(boardColor.opacity(0.85)),
            style: StrokeStyle(lineWidth: max(3.0, scale * 0.02), lineCap: .round)
        )

        func drawWheel(localCenter: CGPoint) {
            let c = world(localCenter)
            let rect = CGRect(
                x: c.x - wheelRadius,
                y: c.y - wheelRadius,
                width: wheelRadius * 2,
                height: wheelRadius * 2
            )
            context.fill(Path(ellipseIn: rect), with: .color(wheelColor))
            context.stroke(
                Path(ellipseIn: rect),
                with: .color(boardColor.opacity(0.8)),
                style: StrokeStyle(lineWidth: max(2, scale * 0.01))
            )

            let core = rect.insetBy(dx: wheelRadius * 0.48, dy: wheelRadius * 0.48)
            context.fill(Path(ellipseIn: core), with: .color(wheelCoreColor))
        }

        drawWheel(localCenter: rearWheelCenterLocal)
        drawWheel(localCenter: frontWheelCenterLocal)

        let torsoWidth = max(16, scale * 0.11)
        let legWidth = max(13, scale * 0.086)
        let armWidth = max(11, scale * 0.075)

        let jumpMix = jumpPulse * 0.90
        let hips = CGPoint(
            x: scale * 0.01 + jumpPulse * scale * 0.006,
            y: -scale * 0.44 - jumpPulse * scale * 0.022 + preCompression * scale * 0.010
        )
        let torsoLength = scale * 0.50
        let torsoLean: CGFloat = 0.17 + jumpPulse * 0.02
        let shoulders = CGPoint(
            x: hips.x + sin(torsoLean) * torsoLength,
            y: hips.y - cos(torsoLean) * torsoLength
        )

        let headRadius = scale * 0.145
        let headCenter = CGPoint(
            x: shoulders.x + scale * 0.03,
            y: shoulders.y - headRadius * 1.30 - jumpPulse * scale * 0.004
        )

        func drawChain(_ points: [CGPoint], width: CGFloat, color: Color) {
            guard let first = points.first else { return }
            var path = Path()
            path.move(to: world(first))
            for point in points.dropFirst() {
                path.addLine(to: world(point))
            }
            context.stroke(
                path,
                with: .color(color),
                style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round)
            )
        }

        let rearFootRide = CGPoint(x: -deckHalf * 0.43, y: -deckThickness * 0.28)
        let rearFootJump = CGPoint(x: -deckHalf * 0.53 - limbSpread * 0.18, y: -deckThickness * 0.31 - jumpPulse * scale * 0.012)
        let rearFoot = CGPoint(x: lerp(rearFootRide.x, rearFootJump.x, jumpMix), y: lerp(rearFootRide.y, rearFootJump.y, jumpMix))

        let frontFootRide = CGPoint(x: deckHalf * 0.20, y: -deckThickness * 0.28)
        let frontFootJump = CGPoint(x: scale * 0.29 + limbSpread * 0.26, y: -scale * 0.05 - jumpPulse * scale * 0.02)
        let frontFoot = CGPoint(x: lerp(frontFootRide.x, frontFootJump.x, jumpMix * 0.95), y: lerp(frontFootRide.y, frontFootJump.y, jumpMix * 0.95))

        let rearKneeRide = CGPoint(x: hips.x - scale * 0.01, y: hips.y + scale * 0.235)
        let rearKneeJump = CGPoint(x: hips.x + scale * 0.055 + limbSpread * 0.11, y: hips.y + scale * 0.185 - jumpPulse * scale * 0.02)
        let rearKnee = CGPoint(x: lerp(rearKneeRide.x, rearKneeJump.x, jumpMix), y: lerp(rearKneeRide.y, rearKneeJump.y, jumpMix))

        let frontKneeRide = CGPoint(x: scale * 0.23, y: -scale * 0.21)
        let frontKneeJump = CGPoint(x: scale * 0.30 + limbSpread * 0.18, y: -scale * 0.34 - jumpPulse * scale * 0.025)
        let frontKnee = CGPoint(x: lerp(frontKneeRide.x, frontKneeJump.x, jumpMix * 0.98), y: lerp(frontKneeRide.y, frontKneeJump.y, jumpMix * 0.98))

        let rearElbowRide = CGPoint(x: shoulders.x - scale * 0.13, y: shoulders.y + scale * 0.14)
        let rearElbowJump = CGPoint(x: shoulders.x - scale * 0.17 - limbSpread * 0.25, y: shoulders.y + scale * 0.10 - jumpPulse * scale * 0.01)
        let rearElbow = CGPoint(x: lerp(rearElbowRide.x, rearElbowJump.x, jumpMix * 0.92), y: lerp(rearElbowRide.y, rearElbowJump.y, jumpMix * 0.92))

        let rearHandRide = CGPoint(x: shoulders.x - scale * 0.18, y: shoulders.y + scale * 0.34)
        let rearHandJump = CGPoint(x: shoulders.x - scale * 0.25 - limbSpread * 0.45, y: shoulders.y + scale * 0.27 - jumpPulse * scale * 0.016)
        let rearHand = CGPoint(x: lerp(rearHandRide.x, rearHandJump.x, jumpMix * 0.94), y: lerp(rearHandRide.y, rearHandJump.y, jumpMix * 0.94))

        let frontElbowRide = CGPoint(x: shoulders.x + scale * 0.14, y: shoulders.y + scale * 0.14)
        let frontElbowJump = CGPoint(x: shoulders.x + scale * 0.19 + limbSpread * 0.24, y: shoulders.y + scale * 0.10 - jumpPulse * scale * 0.010)
        let frontElbow = CGPoint(x: lerp(frontElbowRide.x, frontElbowJump.x, jumpMix * 0.95), y: lerp(frontElbowRide.y, frontElbowJump.y, jumpMix * 0.95))

        let frontHandRide = CGPoint(x: shoulders.x + scale * 0.30, y: shoulders.y + scale * 0.09)
        let frontHandJump = CGPoint(x: shoulders.x + scale * 0.37 + limbSpread * 0.40, y: shoulders.y + scale * 0.01 - jumpPulse * scale * 0.020)
        let frontHand = CGPoint(x: lerp(frontHandRide.x, frontHandJump.x, jumpMix * 0.95), y: lerp(frontHandRide.y, frontHandJump.y, jumpMix * 0.95))

        let rearLegStart = CGPoint(x: hips.x + scale * 0.002, y: hips.y + scale * 0.006)

        drawChain([shoulders, rearElbow, rearHand], width: armWidth, color: stickColor.opacity(0.45))
        drawChain([rearLegStart, rearKnee, rearFoot], width: legWidth, color: stickColor.opacity(0.47))
        drawChain([shoulders, hips], width: torsoWidth, color: stickColor)

        // Head (Goat Mode Support - Skateboard uses cara12.png)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara12_negro" : "cara12"))
            let imgSize = headRadius * 4.76
            let wHeadCenter = world(headCenter)
            let rect = CGRect(
                x: wHeadCenter.x - imgSize/2,
                y: wHeadCenter.y - imgSize/2 - (headRadius * 0.14),
                width: imgSize,
                height: imgSize
            )
            context.draw(headImage, in: rect)
        } else {
            context.fill(
                Path(ellipseIn: CGRect(
                    x: world(headCenter).x - headRadius,
                    y: world(headCenter).y - headRadius,
                    width: headRadius * 2,
                    height: headRadius * 2
                )),
                with: .color(stickColor)
            )
        }

        drawChain([hips, frontKnee, frontFoot], width: legWidth, color: stickColor)
        drawChain([shoulders, frontElbow, frontHand], width: armWidth, color: stickColor)
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        SkateboardView()
            .frame(width: 400, height: 400)
    }
}
