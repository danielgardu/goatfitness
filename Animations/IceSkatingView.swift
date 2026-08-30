import SwiftUI
import Foundation

struct IceSkatingView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 0.82
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate * speed
                self.drawIceSkating(in: &context, size: size, time: t)
            }
        }
        .preferredColorScheme(.dark)
    }
    
    private func drawIceSkating(in context: inout GraphicsContext, size: CGSize, time t: Double) {
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let scale = min(size.width, size.height) * 0.48

        let phase = CGFloat(t * .pi * 2)
        let twoPi = CGFloat.pi * 2
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        let armLen = scale * 0.40
        let legLen = scale * 0.54
        let torsoLen = scale * 0.50
        let armWidth = max(10, scale * 0.070)
        let legWidth = max(12, scale * 0.082)
        let torsoWidth = max(16, scale * 0.11)

        let sharedGlide = sin(phase - 0.55) * scale * 0.030
        let lateralSway = sin(phase) * scale * 0.055
        let bounce = (1 - cos(phase * 2)) * scale * 0.008

        let hips = CGPoint(
            x: center.x + lateralSway,
            y: center.y + scale * 0.23 + bounce
        )

        let torsoLean: CGFloat = 0.15
        let shoulders = CGPoint(
            x: hips.x + sin(torsoLean) * torsoLen,
            y: hips.y - cos(torsoLean) * torsoLen
        )

        let headRadius = scale * 0.145
        let headCenter = CGPoint(
            x: shoulders.x + scale * 0.03,
            y: shoulders.y - headRadius * 1.28
        )

        let iceY = center.y + scale * 0.82

        func drawSkate(at foot: CGPoint, color: Color, isFront: Bool) {
            let opacity = isFront ? 1.0 : 0.42
            let drawColor = color.opacity(opacity)
            let skateShiftX = scale * 0.020
            let f = CGPoint(x: foot.x + skateShiftX, y: foot.y + scale * 0.008)

            let bootWidth = scale * 0.175
            let bootHeight = scale * 0.078
            let bootRect = CGRect(x: f.x - bootWidth * 0.56, y: f.y - bootHeight - scale * 0.006, width: bootWidth, height: bootHeight)
            context.fill(
                Path(roundedRect: bootRect, cornerRadius: scale * 0.022),
                with: .color(drawColor)
            )
            let cuffRect = CGRect(
                x: f.x - bootWidth * 0.49,
                y: f.y - bootHeight - scale * 0.044,
                width: bootWidth * 0.38,
                height: scale * 0.050
            )
            context.fill(Path(roundedRect: cuffRect, cornerRadius: scale * 0.016), with: .color(drawColor))
            let toe = CGRect(
                x: f.x + bootWidth * 0.26,
                y: f.y - bootHeight * 0.54,
                width: bootWidth * 0.24,
                height: bootHeight * 0.46
            )
            context.fill(Path(ellipseIn: toe), with: .color(drawColor))

            var blade = Path()
            let bladeY = f.y + scale * 0.027
            let bladeHalf = scale * 0.154
            let toeRadius = scale * 0.022
            let heelRadius = scale * 0.016
            blade.move(to: CGPoint(x: f.x - bladeHalf, y: bladeY))
            blade.addLine(to: CGPoint(x: f.x + bladeHalf - toeRadius * 0.28, y: bladeY))
            blade.addArc(
                center: CGPoint(x: f.x + bladeHalf - toeRadius * 0.28, y: bladeY - toeRadius),
                radius: toeRadius,
                startAngle: .degrees(90),
                endAngle: .degrees(-35),
                clockwise: true
            )
            blade.move(to: CGPoint(x: f.x - bladeHalf, y: bladeY))
            blade.addArc(center: CGPoint(x: f.x - bladeHalf + heelRadius, y: bladeY - heelRadius), radius: heelRadius, startAngle: .degrees(180), endAngle: .degrees(245), clockwise: false)
            context.stroke(
                blade,
                with: .color(drawColor),
                style: StrokeStyle(lineWidth: scale * 0.016, lineCap: .round, lineJoin: .round)
            )
            var bladeTop = Path()
            bladeTop.move(to: CGPoint(x: f.x - bladeHalf + scale * 0.018, y: bladeY - scale * 0.004))
            bladeTop.addLine(to: CGPoint(x: f.x + bladeHalf - scale * 0.030, y: bladeY - scale * 0.004))
            context.stroke(
                bladeTop,
                with: .color(drawColor.opacity(0.55)),
                style: StrokeStyle(lineWidth: scale * 0.006, lineCap: .round)
            )

            var supports = Path()
            supports.move(to: CGPoint(x: f.x - scale * 0.055, y: f.y - scale * 0.006))
            supports.addLine(to: CGPoint(x: f.x - scale * 0.055, y: bladeY))
            supports.move(to: CGPoint(x: f.x - scale * 0.010, y: f.y - scale * 0.008))
            supports.addLine(to: CGPoint(x: f.x - scale * 0.010, y: bladeY))
            supports.move(to: CGPoint(x: f.x + scale * 0.044, y: f.y - scale * 0.006))
            supports.addLine(to: CGPoint(x: f.x + scale * 0.044, y: bladeY))
            supports.move(to: CGPoint(x: f.x + bladeHalf - scale * 0.012, y: bladeY))
            supports.addLine(to: CGPoint(x: f.x + bladeHalf - scale * 0.002, y: bladeY + scale * 0.020))
            context.stroke(
                supports,
                with: .color(drawColor),
                style: StrokeStyle(lineWidth: scale * 0.010, lineCap: .round)
            )
        }

        func drawArm(start: CGPoint, phaseOffset: CGFloat, isFront: Bool) {
            let p = phase + phaseOffset
            let color = isFront ? stickColor : stickColor.opacity(0.42)
            let width = armWidth

            let upper = sin(p) * 0.24 + (isFront ? 0.07 : -0.05)
            let elbow = CGPoint(
                x: start.x + sin(upper) * armLen * 0.55,
                y: start.y + cos(upper) * armLen * 0.55
            )
            let lower = upper + (isFront ? 0.43 : 0.30)
            let hand = CGPoint(
                x: elbow.x + sin(lower) * armLen * 0.48,
                y: elbow.y + cos(lower) * armLen * 0.48
            )

            var arm = Path()
            arm.move(to: start)
            arm.addLine(to: elbow)
            arm.addLine(to: hand)
            context.stroke(
                arm,
                with: .color(color),
                style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round)
            )
        }

        func drawLeg(
            phaseOffset: CGFloat,
            separation: CGFloat,
            liftPhase: CGFloat,
            isFront: Bool
        ) {
            let p = phase + phaseOffset
            let color = isFront ? stickColor : stickColor.opacity(0.44)
            let width = legWidth

            func smoothStep(_ x: CGFloat) -> CGFloat {
                let c = min(1, max(0, x))
                return c * c * (3 - 2 * c)
            }
            var cycle01 = (p / twoPi).truncatingRemainder(dividingBy: 1)
            if cycle01 < 0 { cycle01 += 1 }

            let stepDuration: CGFloat = 0.28
            let stepProgress = smoothStep(cycle01 / stepDuration)
            let glideProgress = cycle01 > stepDuration ? smoothStep((cycle01 - stepDuration) / (1 - stepDuration)) : 0
            let stride = (stepProgress - glideProgress) * scale * 0.042

            let liftDuration: CGFloat = 0.22
            let footLift: CGFloat
            if cycle01 < liftDuration {
                footLift = sin((cycle01 / liftDuration) * .pi) * scale * 0.010
            } else {
                footLift = 0
            }

            let microAlternate = sin(p + liftPhase) * scale * 0.006
            let footX = hips.x + sharedGlide + stride + microAlternate + separation
            let foot = CGPoint(x: footX, y: iceY - footLift)

            let reach = (foot.x - hips.x) / scale
            let kneePulse = (sin(p + .pi / 2) * 0.5 + 0.5) * scale * 0.022
            let kneeXShift = stride * 0.30
            let knee = CGPoint(
                x: hips.x + reach * scale * 0.52 + separation * 0.33 + kneeXShift,
                y: hips.y + legLen * 0.50 + abs(reach) * scale * 0.045 + kneePulse - footLift * 0.35
            )

            var leg = Path()
            leg.move(to: hips)
            leg.addLine(to: knee)
            leg.addLine(to: foot)
            context.stroke(
                leg,
                with: .color(color),
                style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round)
            )

            drawSkate(at: foot, color: stickColor, isFront: isFront)
        }

        let shadowRect = CGRect(
            x: center.x - scale * 0.70 + sharedGlide * 0.45,
            y: iceY + scale * 0.03,
            width: scale * 1.40,
            height: scale * 0.07
        )
        context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(0.20)))

        // Atrás
        drawArm(start: shoulders, phaseOffset: .pi, isFront: false)
        drawLeg(
            phaseOffset: .pi,
            separation: -scale * 0.065,
            liftPhase: -.pi / 2,
            isFront: false
        )

        // Cuerpo
        var torso = Path()
        torso.move(to: shoulders)
        torso.addLine(to: hips)
        context.stroke(
            torso,
            with: .color(stickColor),
            style: StrokeStyle(lineWidth: torsoWidth, lineCap: .round)
        )

        // Head (Goat Mode Support - Ice Skating uses cara12.png)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara12_negro" : "cara12"))
            let imgSize = headRadius * 4.76
            let rect = CGRect(
                x: headCenter.x - imgSize/2,
                y: headCenter.y - imgSize/2 - (headRadius * 0.14),
                width: imgSize,
                height: imgSize
            )
            context.draw(headImage, in: rect)
        } else {
            context.fill(
                Path(ellipseIn: CGRect(
                    x: headCenter.x - headRadius,
                    y: headCenter.y - headRadius,
                    width: headRadius * 2,
                    height: headRadius * 2
                )),
                with: .color(stickColor)
            )
        }

        // Frente
        drawLeg(
            phaseOffset: 0,
            separation: scale * 0.065,
            liftPhase: .pi / 2,
            isFront: true
        )
        drawArm(start: shoulders, phaseOffset: 0, isFront: true)
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        IceSkatingView()
            .frame(width: 400, height: 400)
    }
}
