import SwiftUI
import Foundation

struct MartialArtsView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 3.0 // Fast, professional pace
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate * speed
                self.drawMartialArts(in: &context, size: size, time: t)
            }
        }
    }
    
    private func drawMartialArts(in context: inout GraphicsContext, size: CGSize, time t: Double) {
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
        
        // Pulse generator for strikes
        func strikePulse(phaseIn: Double, start: Double, peak: Double, end: Double) -> CGFloat {
            if phaseIn < start || phaseIn > end { return 0 }
            if phaseIn < peak {
                return doubleSmoothstep(CGFloat((phaseIn - start) / (peak - start)))
            } else {
                return 1.0 - doubleSmoothstep(CGFloat((phaseIn - peak) / (end - peak)))
            }
        }
        
        // Strike sequence:
        // 1. Right Jab (Front hand): 0.02 → 0.24
        let punch1 = strikePulse(phaseIn: phase, start: 0.02, peak: 0.12, end: 0.24)
        // 2. Left Cross (Back hand): 0.26 → 0.48
        let punch2 = strikePulse(phaseIn: phase, start: 0.26, peak: 0.36, end: 0.48)
        // 3. Left Kick (Back leg): 0.52 → 0.88
        let kick = strikePulse(phaseIn: phase, start: 0.52, peak: 0.68, end: 0.88)
        
        // --- Idle body movement ---
        let breathe = CGFloat(sin(cycle * 2.5)) * 1.5
        let idleSway = CGFloat(sin(cycle * 1.3)) * 2.0
        
        // --- Kinematics (SIDE PROFILE FACING RIGHT) ---
        let groundY = center.y + scale * 0.65
        
        // Weight shifts horizontally towards target on punches, leans back on kick
        let weightShift = (punch1 * 0.1 + punch2 * 0.15) * scale - kick * scale * 0.12
        
        // Slight duck during punches, rise/dip during kick
        let duck = (punch1 * 0.05 + punch2 * 0.08) * scale + kick * scale * 0.02
        
        let hipPos = CGPoint(
            x: center.x - scale * 0.1 + weightShift + idleSway, 
            y: groundY - scale * 0.52 + duck + breathe * 0.3
        )
        
        // Torso leans forward on punches, leans back significantly on the kick for balance
        let torsoLean = 0.15 + punch1 * 0.15 + punch2 * 0.25 - kick * 0.45
        let torsoLen = scale * 0.45
        let shoulderPos = CGPoint(
            x: hipPos.x + sin(torsoLean) * torsoLen,
            y: hipPos.y - cos(torsoLean) * torsoLen
        )
        
        // Head sits atop torso
        let headRad = scale * 0.171
        let headPos = CGPoint(
            x: shoulderPos.x + headRad * 0.6,
            y: shoulderPos.y - headRad * 1.2 + breathe * 0.2
        )
        
        // --- Legs ---
        let stanceWidth = scale * 0.35
        
        // Right leg (FRONT, planted right) - standing pivot during the kick
        let rightFoot = CGPoint(x: center.x + scale * 0.18, y: groundY)
        let rightKneeBend = scale * 0.15
        let rightKnee = CGPoint(
            x: (rightFoot.x + hipPos.x) / 2 + rightKneeBend * 0.8,
            y: (rightFoot.y + hipPos.y) / 2 + rightKneeBend * 0.2
        )
        
        // Left leg (BACK, starts planted left, kicks high right)
        let leftFootDefault = CGPoint(x: center.x - scale * 0.35, y: groundY)
        let leftFootKicked = CGPoint(x: hipPos.x + scale * 0.70, y: groundY - scale * 0.40)
        
        let leftFoot = CGPoint(
            x: leftFootDefault.x + (leftFootKicked.x - leftFootDefault.x) * kick,
            y: leftFootDefault.y + (leftFootKicked.y - leftFootDefault.y) * kick
        )
        
        let leftKneeDefault = CGPoint(
            x: (leftFootDefault.x + hipPos.x) / 2 + scale * 0.12,
            y: (leftFootDefault.y + hipPos.y) / 2 + scale * 0.03
        )
        // Knee chambers high up
        let leftKneeKicked = CGPoint(x: hipPos.x + scale * 0.40, y: groundY - scale * 0.35)
        
        let leftKnee = CGPoint(
            x: leftKneeDefault.x + (leftKneeKicked.x - leftKneeDefault.x) * kick,
            y: leftKneeDefault.y + (leftKneeKicked.y - leftKneeDefault.y) * kick
        )
        
        // --- Arms (Guard setup) ---
        let guardFistX = headPos.x + scale * 0.05
        let guardFistY = headPos.y + scale * 0.15
        let guardElbowX = shoulderPos.x - scale * 0.15
        let guardElbowY = shoulderPos.y + scale * 0.2
        
        // LEFT ARM (BACK ARM) - Punches on punch2
        let leftPunchTargetX = shoulderPos.x + scale * 0.70
        let leftPunchTargetY = shoulderPos.y + scale * 0.02
        
        let leftFistX = guardFistX + (leftPunchTargetX - guardFistX) * punch2 - kick * scale * 0.08
        let leftFistY = guardFistY + (leftPunchTargetY - guardFistY) * punch2 + kick * scale * 0.05
        let leftFist = CGPoint(x: leftFistX - scale * 0.05, y: leftFistY)
        
        let leftElbowBaseX = guardElbowX - scale * 0.1
        let leftElbow = CGPoint(
            x: leftElbowBaseX + (leftFistX - guardFistX) * 0.4,
            y: guardElbowY - punch2 * scale * 0.1
        )
        
        // RIGHT ARM (FRONT ARM) - Punches on punch1
        let rightJabTargetX = shoulderPos.x + scale * 0.65
        let rightJabTargetY = shoulderPos.y + scale * 0.02
        
        let rightFistX = guardFistX + (rightJabTargetX - guardFistX) * punch1 - kick * scale * 0.12
        let rightFistY = guardFistY + (rightJabTargetY - guardFistY) * punch1 + kick * scale * 0.08
        let rightFist = CGPoint(x: rightFistX, y: rightFistY)
        
        let rightElbow = CGPoint(
            x: guardElbowX + (rightFistX - guardFistX) * 0.45,
            y: guardElbowY - punch1 * scale * 0.15 + kick * scale * 0.05
        )
        
        // Fists
        let fistRad = scale * 0.07
        
        // --- Drawing ---
        // 1. Back Leg (Left) - Always drawn behind, always gray (opacity 0.35)
        var backLegPath = Path()
        backLegPath.move(to: hipPos)
        backLegPath.addLine(to: leftKnee)
        backLegPath.addLine(to: leftFoot)
        context.stroke(backLegPath, with: .color(stickColor.opacity(0.35)),
            style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        
        // 2. Back Arm (Left)
        let leftArmOpacity: CGFloat = 0.35
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
        
        // 4. Head (Goat Mode Support - uses cara12.png same as Boxing)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara12_negro" : "cara12"))
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
        
        // 5. Front Leg (Right) - Always solid
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
        MartialArtsView()
            .frame(width: 300, height: 300)
    }
}
