// MARK: - PointingStickmanView.swift
// GOAT Exercise — Stickman that always points right toward the subscribe text

import SwiftUI

struct PointingStickmanView: View {
    @Environment(\.animationColorMode) private var colorMode
    var isGoatMode: Bool = false
    /// Incremented when the button is about to leave the screen, triggering 2 jumps.
    var jumpTrigger: Int = 0
    
    @State private var jumpStartTime: Double = 0

    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                self.draw(
                    in: &context,
                    size: size,
                    time: timeline.date.timeIntervalSinceReferenceDate
                )
            }
        }
        .onChange(of: jumpTrigger) {
            if jumpTrigger > 0 {
                jumpStartTime = Date().timeIntervalSinceReferenceDate
            }
        }
    }

    // MARK: - Draw

    private func draw(in context: inout GraphicsContext, size: CGSize, time: Double) {
        let stickColor: Color = colorMode == .darkStickman ? .black : .white

        // --- Timing ---
        // The arm is ALWAYS pointing right.
        // Every 3s the stickman does two quick "nudge" motions:
        //   fully extended → slightly retracted → fully extended → slightly retracted → fully extended
        // nudgeProgress: 0 = fully extended (pointing), 1 = slightly pulled back (still pointing direction)
        let cycleDuration: Double = 3.0
        let nudgePhaseEnd: Double = 0.8
        let cycleT = time.truncatingRemainder(dividingBy: cycleDuration)

        var nudgeProgress: Double = 0.0  // 0 = full extend, 1 = max retract (only partial)
        if cycleT < nudgePhaseEnd {
            let p = cycleT / nudgePhaseEnd
            let singlePoint = p * 4.0
            let segment = Int(singlePoint)
            let frac = singlePoint - Double(segment)
            switch segment {
            case 0: nudgeProgress = frac
            case 1: nudgeProgress = 1.0 - frac
            case 2: nudgeProgress = frac
            case 3: nudgeProgress = 1.0 - frac
            default: nudgeProgress = 0.0
            }
            nudgeProgress = nudgeProgress * nudgeProgress * (3.0 - 2.0 * nudgeProgress)
        }

        // --- Breathing ---
        let breathCycle = sin(time * .pi * 2 / 2.5)
        let breathFactor = (breathCycle + 1.0) / 2.0

        // --- Jump offset ---
        var jumpOffsetY: CGFloat = 0
        var isJumping = false
        if jumpStartTime > 0 {
            let jumpElapsed = time - jumpStartTime
            // Two continuous bounces using abs(sin)
            let twoJumpsDuration = 1.333
            if jumpElapsed < twoJumpsDuration {
                isJumping = true
                let jumpT = abs(sin(jumpElapsed * .pi * 1.5))
                jumpOffsetY = CGFloat(jumpT) * -25 // negative = up
            }
        }

        // Factor for lifting arms and spreading legs based on jump height
        let liftFactor = max(0, -jumpOffsetY) / 30.0 // 0 to 1

        // --- Body geometry (based on IdleView) ---
        let baseDimension: CGFloat = min(size.width, size.height) * 0.42
        let centerPoint = CGPoint(x: size.width / 2, y: size.height * 0.82 + jumpOffsetY)

        let footSpread: CGFloat = 12 + (6 * liftFactor) // legs open subtly on jump
        let leftFoot  = CGPoint(x: centerPoint.x - footSpread, y: centerPoint.y)
        let rightFoot = CGPoint(x: centerPoint.x + footSpread, y: centerPoint.y)

        let legLen: CGFloat = baseDimension * 0.58
        let hipOffsetY: CGFloat = legLen * (0.98 + breathFactor * 0.02)
        let hipPosition = CGPoint(x: centerPoint.x, y: centerPoint.y - hipOffsetY)

        let kneeSpread: CGFloat = 5
        let leftKneePos = CGPoint(
            x: (leftFoot.x + hipPosition.x) / 2 - kneeSpread,
            y: (leftFoot.y + hipPosition.y) / 2 + 2
        )
        let rightKneePos = CGPoint(
            x: (rightFoot.x + hipPosition.x) / 2 + kneeSpread,
            y: (rightFoot.y + hipPosition.y) / 2 + 2
        )

        let torsoLen: CGFloat = baseDimension * 0.42 * (0.97 + breathFactor * 0.03)
        let shoulderPosition = CGPoint(x: hipPosition.x, y: hipPosition.y - torsoLen)

        let hRadius: CGFloat = baseDimension * 0.19
        let headPos = CGPoint(x: shoulderPosition.x, y: shoulderPosition.y - hRadius * 1.3)

        let armLen: CGFloat = baseDimension * 0.5
        let handSpread: CGFloat = 20
        let elbowSpread: CGFloat = 12

        // ---- LEFT ARM (idle, hangs down, lifts sutilmente on jump) ----
        let lElbow = CGPoint(
            x: shoulderPosition.x - elbowSpread - (5 * liftFactor),
            y: shoulderPosition.y + armLen * 0.45 - (5 * liftFactor)
        )
        let lHand = CGPoint(
            x: shoulderPosition.x - handSpread - (10 * liftFactor),
            y: shoulderPosition.y + armLen * 0.9 - (15 * liftFactor)
        )

        // ---- RIGHT ARM (ALWAYS pointing right) ----
        // Fully extended pointing position (even shorter arm now)
        let rElbowFull = CGPoint(
            x: shoulderPosition.x + baseDimension * 0.20,
            y: shoulderPosition.y + baseDimension * 0.08
        )
        let rHandFull = CGPoint(
            x: shoulderPosition.x + baseDimension * 0.40,
            y: shoulderPosition.y - baseDimension * 0.01
        )

        // Slightly retracted position (still pointing right, just pulled back ~40%)
        let retractAmount: CGFloat = 0.40
        let rElbowRetracted = CGPoint(
            x: rElbowFull.x - (rElbowFull.x - shoulderPosition.x) * retractAmount,
            y: rElbowFull.y + baseDimension * 0.04
        )
        let rHandRetracted = CGPoint(
            x: rHandFull.x - (rHandFull.x - shoulderPosition.x) * retractAmount,
            y: rHandFull.y + baseDimension * 0.03
        )

        // Interpolate between full and retracted based on nudge
        let rElbow = CGPoint(
            x: rElbowFull.x + (rElbowRetracted.x - rElbowFull.x) * nudgeProgress,
            y: rElbowFull.y + (rElbowRetracted.y - rElbowFull.y) * nudgeProgress
        )
        let rHand = CGPoint(
            x: rHandFull.x + (rHandRetracted.x - rHandFull.x) * nudgeProgress,
            y: rHandFull.y + (rHandRetracted.y - rHandFull.y) * nudgeProgress
        )

        // ---- DRAWING ----

        // Torso
        var torsoPath = Path()
        torsoPath.move(to: shoulderPosition)
        torsoPath.addLine(to: hipPosition)
        context.stroke(torsoPath, with: .color(stickColor),
            style: StrokeStyle(lineWidth: 13, lineCap: .round))

        // Legs
        func drawLeg(foot: CGPoint, knee: CGPoint, hip: CGPoint) {
            var p = Path()
            p.move(to: foot)
            p.addLine(to: knee)
            p.addLine(to: hip)
            context.stroke(p, with: .color(stickColor),
                style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        }
        drawLeg(foot: leftFoot, knee: leftKneePos, hip: hipPosition)
        drawLeg(foot: rightFoot, knee: rightKneePos, hip: hipPosition)

        // Arms
        func drawArm(sh: CGPoint, el: CGPoint, ha: CGPoint) {
            var p = Path()
            p.move(to: sh)
            p.addLine(to: el)
            p.addLine(to: ha)
            context.stroke(p, with: .color(stickColor),
                style: StrokeStyle(lineWidth: 10, lineCap: .round, lineJoin: .round))
        }
        drawArm(sh: shoulderPosition, el: lElbow, ha: lHand)
        drawArm(sh: shoulderPosition, el: rElbow, ha: rHand)

        // Head (Drawn last to be on top)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara9frente_negro" : "cara9frente"))
            let imgSize = hRadius * 5.1788 * 0.9
            let rect = CGRect(
                x: headPos.x - imgSize * 0.45,
                y: headPos.y - imgSize / 2 - (hRadius * 0.26) - (imgSize * 0.02),
                width: imgSize,
                height: imgSize
            )
            context.draw(headImage, in: rect)
        } else {
            context.fill(
                Path(ellipseIn: CGRect(
                    x: headPos.x - hRadius, y: headPos.y - hRadius,
                    width: hRadius * 2, height: hRadius * 2
                )),
                with: .color(stickColor)
            )
        }

        // Shadow
        let sWidth: CGFloat = baseDimension * 1.0
        let sRect = CGRect(
            x: centerPoint.x - sWidth / 2,
            y: size.height * 0.82 + 5,
            width: sWidth,
            height: 6
        )
        let shadowOpacity = isJumping ? 0.04 : 0.07
        context.fill(Path(ellipseIn: sRect), with: .color(stickColor.opacity(shadowOpacity)))
    }
}

// MARK: - Scaled wrapper
struct ScaledPointingStickmanView: View {
    var isGoatMode: Bool = false
    var jumpTrigger: Int = 0
    var size: CGFloat = 56

    private let nativeSize: CGFloat = 300
    private var scale: CGFloat { size / nativeSize }

    var body: some View {
        PointingStickmanView(
            isGoatMode: isGoatMode,
            jumpTrigger: jumpTrigger
        )
        .frame(width: nativeSize, height: nativeSize)
        .scaleEffect(scale)
        .frame(width: size, height: size)
        .allowsHitTesting(false)
    }
}

#Preview {
    ZStack {
        Color.blue
        ScaledPointingStickmanView(isGoatMode: false, jumpTrigger: 0, size: 120)
    }
}
