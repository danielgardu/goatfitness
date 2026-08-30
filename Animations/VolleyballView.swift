import SwiftUI
import Foundation

struct VolleyballView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 3.8
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate * speed
                self.drawVolleyball(in: &context, size: size, time: t)
            }
        }
    }
    
    private func drawVolleyball(in context: inout GraphicsContext, size: CGSize, time t: Double) {
        let center = CGPoint(x: size.width * 0.5, y: size.height * 0.5)
        let scale = min(size.width, size.height) * 0.40
        
        // Normalized Cycle: Exactly 0.0 to 1.0
        let cycle = CGFloat((t).truncatingRemainder(dividingBy: .pi * 2) / (.pi * 2))
        
        // --- Helper: Smooth Interpolation ---
        func smooth(_ val: CGFloat) -> CGFloat {
            return val * val * (3 - 2 * val)
        }
        
        func interpolateSmooth(_ from: CGFloat, _ to: CGFloat, _ p: CGFloat) -> CGFloat {
            return from + (to - from) * smooth(p)
        }
        
        // 1. Vertical Motion (Jump & Squat)
        var verticalOffset: CGFloat = 0
        if cycle < 0.15 {
            verticalOffset = 0
        } else if cycle < 0.30 { 
            let p = (cycle - 0.15) / 0.15
            verticalOffset = smooth(p) * scale * 0.1
        } else if cycle < 0.80 {
            let p = (cycle - 0.30) / 0.50
            verticalOffset = scale * 0.1 - sin(p * .pi) * scale * 0.45 
        } else {
            let p = (cycle - 0.80) / 0.20
            verticalOffset = interpolateSmooth(scale * 0.1, 0, p) * (1 - sin(p * .pi))
        }
        
        let hips = CGPoint(x: center.x, y: center.y + scale * 0.22 + verticalOffset)
        
        // 2. Torso Angle
        var torsoAngle: CGFloat = 0.05 
        if cycle > 0.3 && cycle < 0.6 {
            let p = (cycle - 0.3) / 0.3
            torsoAngle = interpolateSmooth(0.05, -0.22, p)
        } else if cycle >= 0.6 && cycle < 0.75 {
            let p = (cycle - 0.6) / 0.15
            torsoAngle = interpolateSmooth(-0.22, 0.45, p)
        } else if cycle >= 0.75 {
            let p = (cycle - 0.75) / 0.25
            torsoAngle = interpolateSmooth(0.45, 0.05, p)
        }
        
        let torsoLen = scale * 0.58
        let shoulders = CGPoint(x: hips.x + sin(torsoAngle) * torsoLen, y: hips.y - cos(torsoAngle) * torsoLen)
        
        let headRad = scale * 0.18 // slightly larger head
        let headCenter = CGPoint(x: shoulders.x + sin(torsoAngle) * headRad * 1.4, y: shoulders.y - cos(torsoAngle) * headRad * 1.4)
        
        // 3. Absolute Precision Physics (Right Arm = Hitter)
        let contactCycle: CGFloat = 0.65
        let armLenTotal = scale * 0.58
        
        let contactAngleU = .pi * 0.55 // Energy angle (Diagonal Forward-Right)
        let contactAngleK = .pi * 0.02 
        let upperSegment = armLenTotal * 0.55
        let lowerSegment = armLenTotal * 0.45
        
        let ctX = sin(contactAngleU) * upperSegment + sin(contactAngleU - contactAngleK) * lowerSegment
        let ctY = cos(contactAngleU) * upperSegment + cos(contactAngleU - contactAngleK) * lowerSegment
        let ballContact = CGPoint(x: shoulders.x + ctX, y: shoulders.y + ctY)
        
        let ballStart = CGPoint(x: shoulders.x + scale * 1.8, y: shoulders.y - scale * 2.0)
        let ballEnd = CGPoint(x: shoulders.x + scale * 4.5, y: shoulders.y - scale * 1.4)
        
        var ballPos = CGPoint.zero
        var ballOpacity: CGFloat = 1.0
        
        if cycle < contactCycle {
            let p = (cycle) / contactCycle
            ballPos = CGPoint(
                x: interpolateSmooth(ballStart.x, ballContact.x, p),
                y: interpolateSmooth(ballStart.y, ballContact.y, p)
            )
        } else {
            let p = (cycle - contactCycle) / (0.35) 
            let boundedP = min(1, p)
            ballPos = CGPoint(
                x: ballContact.x + (ballEnd.x - ballContact.x) * boundedP,
                y: ballContact.y + (ballEnd.y - ballContact.y) * boundedP
            )
            ballOpacity = interpolateSmooth(1.0, 0, min(1, boundedP * 1.1)) 
        }
        
        let colorBase: Color = colorMode == .darkStickman ? .black : .white
        let legLen = scale * 0.55
        
        // --- Kinematics ---
        func getJoints(start: CGPoint, armL: CGFloat, uAng: CGFloat, kAng: CGFloat) -> (CGPoint, CGPoint) {
            let upper = CGPoint(x: start.x + sin(uAng) * armL * 0.55, y: start.y + cos(uAng) * armL * 0.55)
            let lower = CGPoint(x: upper.x + sin(uAng - kAng) * armL * 0.45, y: upper.y + cos(uAng - kAng) * armL * 0.45)
            return (upper, lower)
        }
        
        // A. Right Arm (HITTER - 100% Opacity)
        var rU: CGFloat = .pi * 0.1, rK: CGFloat = .pi * 0.1 
        if cycle < 0.25 {
            let p = cycle / 0.25
            rU = interpolateSmooth(.pi * 0.1, 0, p) 
            rK = interpolateSmooth(.pi * 0.1, .pi * 0.2, p)
        } else if cycle < 0.6 { // High Coil
            let p = (cycle - 0.25) / 0.35
            rU = interpolateSmooth(0, .pi * 0.85, p) 
            rK = interpolateSmooth(.pi * 0.2, -.pi * 0.4, p) 
        } else if cycle < 0.68 { // Strike
            let p = (cycle - 0.6) / 0.08
            rU = interpolateSmooth(.pi * 0.85, contactAngleU, p)
            rK = interpolateSmooth(-.pi * 0.4, contactAngleK, p)
        } else { // Follow through
            let p = (cycle - 0.68) / 0.32
            rU = interpolateSmooth(contactAngleU, .pi * 0.1, p)
            rK = 0.1
        }
        
        // B. Left Arm (GUIDE - 40% Opacity) [STRIKE RESPONSE]
        var lU: CGFloat = -.pi * 0.05, lK: CGFloat = -.pi * 0.05
        if cycle < 0.6 {
            let p = cycle / 0.6
            lU = interpolateSmooth(-.pi * 0.05, .pi * 0.25, p) 
            lK = interpolateSmooth(-.pi * 0.05, -.pi * 0.05, p) 
        } else if cycle < 0.72 { // REACTION: Bend elbow and point up slightly
            let p = (cycle - 0.6) / 0.12
            // At 0.65 (impact), lU = 0.45.pi (Up-ish), lK = 0.3.pi (Bent)
            lU = interpolateSmooth(.pi * 0.25, .pi * 0.45, p * (1-p) * 4) 
            lK = interpolateSmooth(-.pi * 0.05, .pi * 0.3, p * (1-p) * 4) // Temporary bend
        } else {
            let p = (cycle - 0.72) / 0.28
            lU = interpolateSmooth(.pi * 0.25, -.pi * 0.05, p)
            lK = -.pi * 0.05
        }
        
        let (hitterE, hitterH) = getJoints(start: shoulders, armL: armLenTotal, uAng: rU, kAng: rK)
        let (guideE, guideH) = getJoints(start: shoulders, armL: armLenTotal, uAng: lU, kAng: lK)
        
        // C. Legs
        func getLeg(isRight: Bool) -> (CGPoint, CGPoint) {
            var uA: CGFloat = 0.1, kA: CGFloat = -0.1
            if cycle > 0.3 && cycle < 0.8 {
                let p = (cycle - 0.3) / 0.5
                if isRight {
                    uA = interpolateSmooth(0.1, 1.0, sin(p * .pi)); kA = interpolateSmooth(-0.1, 1.6, sin(p * .pi))
                } else {
                    uA = interpolateSmooth(-0.1, 0.4, sin(p * .pi)); kA = interpolateSmooth(-0.1, 0.2, sin(p * .pi))
                }
            } else {
                let p = (cycle < 0.3) ? (cycle/0.3) : (1 - (cycle-0.8)/0.2)
                uA = 0.1 + sin(p * .pi) * 0.2; kA = -0.1 + sin(p * .pi) * 0.4
            }
            let knee = CGPoint(x: hips.x + sin(uA + (isRight ? 0.2 : -0.2)) * legLen * 0.5, y: hips.y + cos(uA + (isRight ? 0.2 : -0.2)) * legLen * 0.5)
            let foot = CGPoint(x: knee.x + sin(uA - kA + (isRight ? 0.2 : -0.2)) * legLen * 0.5, y: knee.y + cos(uA - kA + (isRight ? 0.2 : -0.2)) * legLen * 0.5)
            return (knee, foot)
        }
        let (lk, lf) = getLeg(isRight: false); let (rk, rf) = getLeg(isRight: true)
        
        // --- Render Layers ---
        let sS = 1.0 - (abs(verticalOffset) / (scale * 1.0)); let sW = scale * 0.8 * max(0.1, sS)
        context.fill(Path(ellipseIn: CGRect(x: center.x - sW/2, y: center.y + scale * 0.8, width: sW, height: 10)), with: .color(.black.opacity(0.15 * Double(max(0, sS)))))
        
        func drawLimbAt(start: CGPoint, elbow: CGPoint, end: CGPoint, color: Color, width: CGFloat) {
            var p = Path(); p.move(to: start); p.addLine(to: elbow); p.addLine(to: end); context.stroke(p, with: .color(color), style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
        }
        
        drawLimbAt(start: shoulders, elbow: guideE, end: guideH, color: colorBase.opacity(0.4), width: 12)
        drawLimbAt(start: hips, elbow: lk, end: lf, color: colorBase.opacity(0.4), width: 14)
        
        var tp = Path(); tp.move(to: hips); tp.addLine(to: shoulders); context.stroke(tp, with: .color(colorBase), style: StrokeStyle(lineWidth: 18, lineCap: .round))
        
        // Head (Goat Mode Support - Volleyball uses cara12.png)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara12_negro" : "cara12"))
            let imgSize = headRad * 4.76
            let rect = CGRect(
                x: headCenter.x - imgSize/2,
                y: headCenter.y - imgSize/2 - (headRad * 0.14),
                width: imgSize,
                height: imgSize
            )
            context.draw(headImage, in: rect)
        } else {
            context.fill(Path(ellipseIn: CGRect(x: headCenter.x - headRad, y: headCenter.y - headRad, width: headRad * 2, height: headRad * 2)), with: .color(colorBase))
        }
        
        drawLimbAt(start: hips, elbow: rk, end: rf, color: colorBase, width: 14)
        drawLimbAt(start: shoulders, elbow: hitterE, end: hitterH, color: colorBase, width: 12)
        
        // VOLLEYBALL
        if cycle < 0.98 {
            let ballRad = scale * 0.15
            let ballPath = Path(ellipseIn: CGRect(x: ballPos.x - ballRad, y: ballPos.y - ballRad, width: ballRad * 2, height: ballRad * 2))
            context.fill(ballPath, with: .color(colorBase.opacity(ballOpacity)))
        }
    }
}
