import SwiftUI
import Foundation

struct LegTrainingView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 2.2
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                draw(context: &context, size: size, timeline: timeline)
            }
        }
    }
    
    private func draw(context: inout GraphicsContext, size: CGSize, timeline: TimelineViewDefaultContext) {
        // Center the 300x300 drawing area within the actual canvas (500x500)
        // and apply an additional y-offset to move it lower as requested.
        
         // Force drawing logic to 300x300 base
        let t = timeline.date.timeIntervalSinceReferenceDate * speed
        let center = CGPoint(x: size.width / 2, y: size.height / 2) // Baseline within the 300 area
        let scale = min(size.width, size.height) * 0.38
        
        let cycle = t.truncatingRemainder(dividingBy: .pi * 2)
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        
        // Squat cycle: smooth 0→1→0
        let rawProgress = (1 - cos(CGFloat(cycle))) / 2
        let squatProgress = rawProgress * rawProgress * (3 - 2 * rawProgress)
        
        // --- Ground ---
        let groundY = center.y + scale * 0.6
        
        // --- Feet (shoulder-width, fixed) ---
        let footSpread: CGFloat = scale * 0.38
        let leftFoot = CGPoint(x: center.x - footSpread, y: groundY)
        let rightFoot = CGPoint(x: center.x + scale * 0.26, y: groundY) // Moved slightly back for 90° knee angle
        
        // --- Hips (drop during squat) — SHORTER legs ---
        let standingHipY = groundY - scale * 0.55  // shorter legs
        let squatHipY = groundY - scale * 0.28
        let hipY = standingHipY + (squatHipY - standingHipY) * squatProgress
        let hipX = center.x - squatProgress * scale * 0.06
        let hipPos = CGPoint(x: hipX, y: hipY)
        
        // --- Knees (2-bone IK for proper bending) ---
        let thighLen: CGFloat = scale * 0.28
        let shinLen: CGFloat = scale * 0.28
        
        func solveKnee(hip: CGPoint, foot: CGPoint) -> CGPoint {
            let dx = foot.x - hip.x
            let dy = foot.y - hip.y
            var dist = sqrt(dx * dx + dy * dy)
            
            let maxDist = thighLen + shinLen - 1
            let minDist = abs(thighLen - shinLen) + 1
            dist = max(minDist, min(dist, maxDist))
            
            let baseAngle = atan2(dx, dy)
            let cosA = (thighLen * thighLen + dist * dist - shinLen * shinLen) / (2 * thighLen * dist)
            let a = acos(max(-1, min(1, cosA)))
            
            // Knees bend forward (positive x direction)
            let kneeAngle = baseAngle + a
            
            return CGPoint(
                x: hip.x + sin(kneeAngle) * thighLen,
                y: hip.y + cos(kneeAngle) * thighLen
            )
        }
        
        let leftKnee = solveKnee(hip: hipPos, foot: leftFoot)
        let rightKnee = solveKnee(hip: hipPos, foot: rightFoot)
        
        // --- Torso (slight forward lean during squat) ---
        let torsoLen: CGFloat = scale * 0.48
        let torsoLean: CGFloat = squatProgress * 0.22
        let shoulderPos = CGPoint(
            x: hipPos.x + sin(torsoLean) * torsoLen,
            y: hipPos.y - cos(torsoLean) * torsoLen
        )
        
        // --- Head ---
        let headRad: CGFloat = scale * 0.16
        let headPos = CGPoint(
            x: shoulderPos.x + sin(torsoLean) * headRad * 0.5,
            y: shoulderPos.y - headRad * 1.4
        )
        
        // --- Arms (extend forward during squat for balance) ---
        let armLen: CGFloat = scale * 0.42
        let armRaise: CGFloat = squatProgress * 1.1
        let armBaseAngle: CGFloat = 0.1
        let armAngle = armBaseAngle + armRaise
        
        // Front arm
        let frontElbow = CGPoint(
            x: shoulderPos.x + sin(armAngle) * armLen * 0.55,
            y: shoulderPos.y + cos(armAngle) * armLen * 0.55
        )
        let elbowBend: CGFloat = 0.15 + squatProgress * 0.2
        let frontHand = CGPoint(
            x: frontElbow.x + sin(armAngle + elbowBend) * armLen * 0.45,
            y: frontElbow.y + cos(armAngle + elbowBend) * armLen * 0.45
        )
        
        // Back arm
        let backElbow = CGPoint(
            x: shoulderPos.x + sin(armAngle) * armLen * 0.5,
            y: shoulderPos.y + cos(armAngle) * armLen * 0.5
        )
        let backHand = CGPoint(
            x: backElbow.x + sin(armAngle + elbowBend) * armLen * 0.4,
            y: backElbow.y + cos(armAngle + elbowBend) * armLen * 0.4
        )
        
        // --- Drawing ---
        
        // Back arm
        var backArmPath = Path()
        backArmPath.move(to: shoulderPos)
        backArmPath.addLine(to: backElbow)
        backArmPath.addLine(to: backHand)
        context.stroke(backArmPath, with: .color(stickColor.opacity(0.35)),
            style: StrokeStyle(lineWidth: 10, lineCap: .round, lineJoin: .round))
        
        // Back leg
        var backLeg = Path()
        backLeg.move(to: hipPos)
        backLeg.addLine(to: leftKnee)
        backLeg.addLine(to: leftFoot)
        context.stroke(backLeg, with: .color(stickColor.opacity(0.35)),
            style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        
        // --- Head (Goat Mode Support) ---
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara6_negro" : "cara6"))
            let imgSize = headRad * 4.76
            let rect = CGRect(
                x: headPos.x - imgSize/2,
                y: headPos.y - imgSize/2 - (headRad * 0.14),
                width: imgSize,
                height: imgSize
            )
            context.draw(headImage, in: rect)
        } else {
            context.fill(
                Path(ellipseIn: CGRect(
                    x: headPos.x - headRad, y: headPos.y - headRad,
                    width: headRad * 2, height: headRad * 2
                )),
                with: .color(stickColor)
            )
        }
        
        // Torso
        var torsoPath = Path()
        torsoPath.move(to: shoulderPos)
        torsoPath.addLine(to: hipPos)
        context.stroke(torsoPath, with: .color(stickColor),
            style: StrokeStyle(lineWidth: 13, lineCap: .round))
        
        // Front leg
        var frontLeg = Path()
        frontLeg.move(to: hipPos)
        frontLeg.addLine(to: rightKnee)
        frontLeg.addLine(to: rightFoot)
        context.stroke(frontLeg, with: .color(stickColor),
            style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        
        // Front arm
        var frontArmPath = Path()
        frontArmPath.move(to: shoulderPos)
        frontArmPath.addLine(to: frontElbow)
        frontArmPath.addLine(to: frontHand)
        context.stroke(frontArmPath, with: .color(stickColor),
            style: StrokeStyle(lineWidth: 10, lineCap: .round, lineJoin: .round))
        
        // Shadow
        let sW = scale * (0.7 + squatProgress * 0.3)
        let shadowRect = CGRect(x: center.x - sW / 2, y: groundY + 5, width: sW, height: 7)
        context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(0.18)))
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        LegTrainingView()
            .frame(width: 300, height: 300)
    }
}
