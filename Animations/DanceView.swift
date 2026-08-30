import SwiftUI
import Foundation

struct DanceView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 3.0
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate * speed
                self.drawDance(into: &context, size: size, time: t)
            }
        }
    }
    
    private func drawDance(into context: inout GraphicsContext, size: CGSize, time t: Double) {
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let scale = min(size.width, size.height) * 0.42
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        
        // --- TIMING & GROOVE ---
        let sway = CGFloat(sin(t))
        let bounce = CGFloat(abs(sin(t)))
        
        // --- GROUND & HIPS ---
        let groundY = center.y + scale * 0.45
        let hipX = center.x + scale * 0.15 * sway
        let hipPos = CGPoint(x: hipX, y: groundY - scale * 0.5 + scale * 0.08 * bounce)
        
        // --- TORSO & HEAD ---
        let torsoLen: CGFloat = scale * 0.38
        let torsoAngle = -(.pi / 2) + 0.18 * sway
        let shoulderPos = CGPoint(
            x: hipPos.x + cos(torsoAngle) * torsoLen,
            y: hipPos.y + sin(torsoAngle) * torsoLen
        )
        
        let headRad: CGFloat = scale * 0.14
        let headAngle = torsoAngle + 0.15 * CGFloat(sin(t - .pi/2))
        let headPos = CGPoint(
            x: shoulderPos.x + cos(headAngle) * headRad * 1.3,
            y: shoulderPos.y + sin(headAngle) * headRad * 1.3
        )
        
        // --- LEGS (Inverse Kinematics) ---
        let thighLen: CGFloat = scale * 0.28
        let shinLen: CGFloat = scale * 0.28
        
        let refRightFootX = center.x + scale * 0.22
        let refLeftFootX = center.x - scale * 0.22
        
        let rLiftRaw = max(0, -sway)
        let rLift = rLiftRaw * rLiftRaw * (3 - 2 * rLiftRaw) 
        
        let lLiftRaw = max(0, sway)
        let lLift = lLiftRaw * lLiftRaw * (3 - 2 * lLiftRaw)
        
        let rightFoot = CGPoint(
            x: refRightFootX - scale * 0.06 * rLift,
            y: groundY - scale * 0.12 * rLift
        )
        
        let leftFoot = CGPoint(x: refLeftFootX + scale * 0.06 * lLift, y: groundY - scale * 0.12 * lLift)
        
        let rightKnee = calculateKneeIK(hip: hipPos, foot: rightFoot, bendRight: true, thighLen: thighLen, shinLen: shinLen)
        let leftKnee = calculateKneeIK(hip: hipPos, foot: leftFoot, bendRight: false, thighLen: thighLen, shinLen: shinLen)
        
        // --- ARMS (Inverse Kinematics) ---
        let armLen: CGFloat = scale * 0.26
        let forearmLen: CGFloat = scale * 0.26
        
        let rightHand = CGPoint(
            x: shoulderPos.x + scale * 0.35 + scale * 0.18 * CGFloat(sin(t)),
            y: shoulderPos.y + scale * 0.2 + scale * 0.18 * CGFloat(sin(t * 2))
        )
        
        let leftHand = CGPoint(
            x: shoulderPos.x - scale * 0.35 + scale * 0.18 * CGFloat(sin(t + .pi)),
            y: shoulderPos.y + scale * 0.2 + scale * 0.18 * CGFloat(sin(t * 2 + .pi))
        )
        
        let rightElbow = calculateElbowIK(shoulder: shoulderPos, hand: rightHand, bendDown: true, armLen: armLen, forearmLen: forearmLen)
        let leftElbow = calculateElbowIK(shoulder: shoulderPos, hand: leftHand, bendDown: true, armLen: armLen, forearmLen: forearmLen)
        
        // --- DRAWING ---
        
        // Back Arm (left)
        drawLine(in: context, shoulderPos, leftElbow, leftHand, color: stickColor.opacity(0.4), width: 9)
        // Back Leg (left)
        drawLine(in: context, hipPos, leftKnee, leftFoot, color: stickColor.opacity(0.4), width: 11)
        
        // Torso
        var torsoPath = Path()
        torsoPath.move(to: shoulderPos)
        torsoPath.addLine(to: hipPos)
        context.stroke(torsoPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 13, lineCap: .round))
        
        // Head (Goat Mode Support - Dance uses cara9frente.png)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "carafrenteespejo_negro" : "carafrenteespejo"))
            let imgSize = headRad * 5.1788 // 10% larger than previous
            let rect = CGRect(
                x: headPos.x - imgSize * 0.55, // 10% left shift from current (net 5% left shift)
                y: headPos.y - imgSize/2 - (headRad * 0.26) - (imgSize * 0.05), // 5% more up
                width: imgSize,
                height: imgSize
            )
            context.draw(headImage, in: rect)
        } else {
            context.fill(Path(ellipseIn: CGRect(
                x: headPos.x - headRad, y: headPos.y - headRad,
                width: headRad * 2, height: headRad * 2
            )), with: .color(stickColor))
        }
        
        // Front Leg (right)
        drawLine(in: context, hipPos, rightKnee, rightFoot, color: stickColor, width: 12)
        // Front Arm (right)
        drawLine(in: context, shoulderPos, rightElbow, rightHand, color: stickColor, width: 10)
        
        // Shadow
        let sW = scale * 1.5 - scale * 0.2 * bounce
        let shadowRect = CGRect(x: center.x - sW / 2, y: groundY + 8, width: sW, height: 5)
        context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(0.15)))
    }
    
    private func calculateKneeIK(hip: CGPoint, foot: CGPoint, bendRight: Bool, thighLen: CGFloat, shinLen: CGFloat) -> CGPoint {
        let d = hypot(foot.x - hip.x, foot.y - hip.y)
        let dist = min(d, thighLen + shinLen - 0.001)
        let angleToFoot = atan2(foot.y - hip.y, foot.x - hip.x)
        let cosC = (thighLen * thighLen + dist * dist - shinLen * shinLen) / (2 * thighLen * dist)
        let offset = acos(max(-1, min(1, cosC)))
        let kneeAngle = bendRight ? (angleToFoot - offset) : (angleToFoot + offset)
        return CGPoint(x: hip.x + cos(kneeAngle) * thighLen, y: hip.y + sin(kneeAngle) * thighLen)
    }
    
    private func calculateElbowIK(shoulder: CGPoint, hand: CGPoint, bendDown: Bool, armLen: CGFloat, forearmLen: CGFloat) -> CGPoint {
        let d = hypot(hand.x - shoulder.x, hand.y - shoulder.y)
        let dist = min(d, armLen + forearmLen - 0.001)
        let angleToHand = atan2(hand.y - shoulder.y, hand.x - shoulder.x)
        let cosC = (armLen * armLen + dist * dist - forearmLen * forearmLen) / (2 * armLen * dist)
        let offset = acos(max(-1, min(1, cosC)))
        let elbowAngle: CGFloat
        if angleToHand > -.pi/2 && angleToHand < .pi/2 {
            elbowAngle = bendDown ? (angleToHand + offset) : (angleToHand - offset)
        } else {
            elbowAngle = bendDown ? (angleToHand - offset) : (angleToHand + offset)
        }
        return CGPoint(x: shoulder.x + cos(elbowAngle) * armLen, y: shoulder.y + sin(elbowAngle) * armLen)
    }
    
    private func drawLine(in context: GraphicsContext, _ p1: CGPoint, _ p2: CGPoint, _ p3: CGPoint, color: Color, width: CGFloat) {
        var path = Path()
        path.move(to: p1)
        path.addLine(to: p2)
        path.addLine(to: p3)
        context.stroke(path, with: .color(color), style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        DanceView()
            .frame(width: 300, height: 300)
    }
}
