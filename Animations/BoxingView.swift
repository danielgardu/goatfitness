import SwiftUI
import Foundation

struct BoxingView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 3.0 // Fast, professional pace
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate * speed
                self.drawBoxing(in: &context, size: size, time: t)
            }
        }
    }
    
    private func drawBoxing(in context: inout GraphicsContext, size: CGSize, time t: Double) {
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let scale = min(size.width, size.height) * 0.38
        
        // Normalized cycle 0→1
        let cycle = t.truncatingRemainder(dividingBy: .pi * 2)
        let phase = cycle / (.pi * 2)
        
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        
        // --- Easing helpers ---
        func smoothstep(_ t: CGFloat) -> CGFloat {
            let c = max(0, min(1, t))
            return c * c * (3 - 2 * c)
        }
        
        func doubleSmoothstep(_ t: CGFloat) -> CGFloat {
            let s = smoothstep(t)
            return s * s * (3 - 2 * s)
        }
        
        // Pulse generator for punches
        func punchPulse(phaseIn: Double, start: Double, peak: Double, end: Double) -> CGFloat {
            if phaseIn < start || phaseIn > end { return 0 }
            if phaseIn < peak {
                return doubleSmoothstep(CGFloat((phaseIn - start) / (peak - start)))
            } else {
                return 1.0 - doubleSmoothstep(CGFloat((phaseIn - peak) / (end - peak)))
            }
        }
        
        // Punch 1: Right Jab (Front hand)
        let punch1 = punchPulse(phaseIn: phase, start: 0.02, peak: 0.10, end: 0.22)
        // Punch 2: Right Cross (Front hand again, deeper)
        let punch2 = punchPulse(phaseIn: phase, start: 0.24, peak: 0.35, end: 0.46)
        // Punch 3: Left Cross (Back hand)
        let punch3 = punchPulse(phaseIn: phase, start: 0.48, peak: 0.60, end: 0.73)
        
        // --- Idle body movement ---
        let breathe = CGFloat(sin(cycle * 2.5)) * 1.5
        let idleSway = CGFloat(sin(cycle * 1.3)) * 2.0
        
        // --- Kinematics (SIDE PROFILE FACING RIGHT) ---
        let groundY = center.y + scale * 0.65
        
        // Weight shifts horizontally towards the target (right) on punches
        let weightShift = (punch1 * 0.1 + punch2 * 0.15 + punch3 * 0.2) * scale
        
        // Slight duck during punches
        let duck = (punch1 * 0.05 + punch2 * 0.08 + punch3 * 0.06) * scale
        
        let hipPos = CGPoint(
            x: center.x - scale * 0.1 + weightShift + idleSway, 
            y: groundY - scale * 0.52 + duck + breathe * 0.3
        )
        
        // Torso leans forward (right) slightly, more so on punches
        let torsoLean = 0.15 + punch1 * 0.15 + punch2 * 0.25 + punch3 * 0.20
        let torsoLen = scale * 0.45
        let shoulderPos = CGPoint(
            x: hipPos.x + sin(torsoLean) * torsoLen,
            y: hipPos.y - cos(torsoLean) * torsoLen
        )
        
        // Head sits atop torso, tucked slightly
        let headRad = scale * 0.171
        let headPos = CGPoint(
            x: shoulderPos.x + headRad * 0.6,
            y: shoulderPos.y - headRad * 1.2 + breathe * 0.2
        )
        
        // --- Legs ---
        let stanceWidth = scale * 0.35
        
        // Left leg (BACK, planted left)
        let leftFoot = CGPoint(x: center.x - scale * 0.35, y: groundY)
        // Right leg (FRONT, planted right)
        // Foot shifts slightly forward on big punches
        let rightFootShift = (punch2 * 0.1 + punch3 * 0.05) * scale
        let rightFoot = CGPoint(x: center.x + scale * 0.25 + rightFootShift, y: groundY)
        
        let kneeBend = scale * 0.15
        // Back knee (Left) bends forwards/down (to the right)
        let leftKnee = CGPoint(
            x: (leftFoot.x + hipPos.x) / 2 + kneeBend * 0.8,
            y: (leftFoot.y + hipPos.y) / 2 + kneeBend * 0.2
        )
        // Front knee (Right) bends forwards/down
        let rightKnee = CGPoint(
            x: (rightFoot.x + hipPos.x) / 2 + kneeBend * 0.8,
            y: (rightFoot.y + hipPos.y) / 2 + kneeBend * 0.2
        )
        
        // --- Arms ---
        // Guard positions (relative to shoulder and head)
        let guardFistX = headPos.x + scale * 0.05
        let guardFistY = headPos.y + scale * 0.15
        let guardElbowX = shoulderPos.x - scale * 0.15
        let guardElbowY = shoulderPos.y + scale * 0.2
        
        // LEFT ARM (BACK ARM) - Punches on punch3
        let leftPunchTargetX = shoulderPos.x + scale * 0.70
        let leftPunchTargetY = shoulderPos.y + scale * 0.02
        
        let leftFistX = guardFistX + (leftPunchTargetX - guardFistX) * punch3
        let leftFistY = guardFistY + (leftPunchTargetY - guardFistY) * punch3
        let leftFist = CGPoint(x: leftFistX - scale * 0.05, y: leftFistY) // Slightly behind to sell depth
        
        let leftElbowBaseX = guardElbowX - scale * 0.1 // Back arm elbow a bit further back
        let leftElbow = CGPoint(
            x: leftElbowBaseX + (leftFistX - guardFistX) * 0.4,
            y: guardElbowY - punch3 * scale * 0.1
        )
        
        // RIGHT ARM (FRONT ARM) - Punches on punch1 and punch2
        let rightJabTargetX = shoulderPos.x + scale * 0.65
        let rightJabTargetY = shoulderPos.y + scale * 0.02
        
        let rightCrossTargetX = shoulderPos.x + scale * 0.70
        let rightCrossTargetY = shoulderPos.y + scale * 0.02
        
        let rightFistX = guardFistX 
            + (rightJabTargetX - guardFistX) * punch1 
            + (rightCrossTargetX - guardFistX) * punch2
        let rightFistY = guardFistY
            + (rightJabTargetY - guardFistY) * punch1
            + (rightCrossTargetY - guardFistY) * punch2
        let rightFist = CGPoint(x: rightFistX, y: rightFistY)
        
        // Right elbow raises up when punching
        let rightElbow = CGPoint(
            x: guardElbowX + (rightFistX - guardFistX) * 0.45,
            y: guardElbowY - (punch1 + punch2) * scale * 0.15
        )
        
        // Fists
        let fistRad = scale * 0.07
        
        // --- Drawing ---
        // For a side profile, draw back elements first, then core, then front elements.
        
        // 1. Back Leg (Left)
        var backLegPath = Path()
        backLegPath.move(to: hipPos)
        backLegPath.addLine(to: leftKnee)
        backLegPath.addLine(to: leftFoot)
        context.stroke(backLegPath, with: .color(stickColor.opacity(0.35)),
            style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        
        // 2. Back Arm (Left)
        let leftArmOpacity: CGFloat = 0.35 // Consistent back arm depth
        var leftArmPath = Path()
        leftArmPath.move(to: shoulderPos)
        leftArmPath.addLine(to: leftElbow)
        leftArmPath.addLine(to: leftFist)
        context.stroke(leftArmPath, with: .color(stickColor.opacity(leftArmOpacity)),
            style: StrokeStyle(lineWidth: 11, lineCap: .round, lineJoin: .round))
        
        // 3. Torso
        var torsoPath = Path()
        torsoPath.move(to: shoulderPos)
        torsoPath.addLine(to: hipPos)
        context.stroke(torsoPath, with: .color(stickColor),
            style: StrokeStyle(lineWidth: 15, lineCap: .round))
        
        // 4. Head (Goat Mode Support - Boxing uses cara12.png)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara12_negro" : "cara12"))
            let imgSize = headRad * 4.76 // Consistent 70% scale increase (approx)
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
        
        // 5. Front Leg (Right)
        var frontLegPath = Path()
        frontLegPath.move(to: hipPos)
        frontLegPath.addLine(to: rightKnee)
        frontLegPath.addLine(to: rightFoot)
        context.stroke(frontLegPath, with: .color(stickColor),
            style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        
        // 6. Front Arm (Right)
        var rightArmPath = Path()
        rightArmPath.move(to: shoulderPos)
        rightArmPath.addLine(to: rightElbow)
        rightArmPath.addLine(to: rightFist)
        context.stroke(rightArmPath, with: .color(stickColor),
            style: StrokeStyle(lineWidth: 11, lineCap: .round, lineJoin: .round))
        
        context.fill(
            Path(ellipseIn: CGRect(
                x: rightFist.x - fistRad, y: rightFist.y - fistRad,
                width: fistRad * 2, height: fistRad * 2
            )),
            with: .color(stickColor)
        )
        
        // Shadow
        let shadowW = stanceWidth * 3.0 + weightShift * 0.5
        let shadowRect = CGRect(
            x: center.x - shadowW * 0.45 + weightShift * 0.5,
            y: groundY + 5,
            width: shadowW,
            height: 7
        )
        context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(0.15)))
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        BoxingView()
            .frame(width: 300, height: 300)
    }
}
