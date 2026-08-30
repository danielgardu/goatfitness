import SwiftUI
import Foundation

struct BasketballView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 0.40 // Slower as requested
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate * speed
                self.drawBasketball(in: &context, size: size, time: t)
            }
        }
    }
    
    private func drawBasketball(in context: inout GraphicsContext, size: CGSize, time t: Double) {
        // Center the 300x300 drawing area within the actual canvas (500x500)
        // and apply an additional y-offset to move it lower as requested.
        
         // Force internal math to 300x300 base
        let scale = min(size.width, size.height) * 0.4
        let cycle = t.truncatingRemainder(dividingBy: 1.0)
        
        func phase(_ c: Double, _ start: Double, _ end: Double) -> Double {
            if c <= start { return 0 }
            if c >= end { return 1 }
            return (c - start) / (end - start)
        }
        
        func smoothStep(_ x: Double) -> Double {
            return x * x * (3 - 2 * x)
        }
        
        func smoothPhase(_ c: Double, _ start: Double, _ end: Double) -> Double {
            return smoothStep(phase(c, start, end))
        }
        
        let releaseTime = 0.20
        let swishTime = 0.35
        let floorTime = 0.45
        let catchTime = 0.55
        
        let shiftedCenter = CGPoint(x: size.width / 2, y: size.height / 2 + scale * 0.3)
        
        func getKinematics(c: Double) -> (hips: CGPoint, shoulders: CGPoint, squat: Double, shootPhase: Double, dribbleArmAction: Double) {
            let squatPhase = phase(c, 0, 0.20)
            let squat = sin(CGFloat(squatPhase * .pi))
            let jumpExit = smoothPhase(c, 0.10, 0.20) - smoothPhase(c, 0.40, 0.55)
            
            let baseHipX = shiftedCenter.x - scale * 0.4
            let baseHipY = shiftedCenter.y + scale * 0.2
            
            let hipYOffset = squat * (scale * 0.15) - jumpExit * (scale * 0.05)
            let hips = CGPoint(x: baseHipX, y: baseHipY + hipYOffset)
            
            let leanAngle = -0.05 + squat * 0.10
            let torsoLen = scale * 0.55
            let shoulders = CGPoint(
                x: hips.x + sin(CGFloat(leanAngle)) * torsoLen,
                y: hips.y - cos(CGFloat(leanAngle)) * torsoLen
            )
            
            let shootPhase = smoothPhase(c, 0.10, 0.20) - smoothPhase(c, 0.35, 0.55)
            
            let isDribbling = c >= 0.55
            let dribbleNorm = isDribbling ? (c - 0.55) / 0.45 : 0
            let localDribble = (dribbleNorm * 3).truncatingRemainder(dividingBy: 1.0)
            let dribbleArmAction = isDribbling ? sin(localDribble * .pi) : 0.0
            
            return (hips, shoulders, Double(squat), shootPhase, dribbleArmAction)
        }
        
        let kinematics = getKinematics(c: cycle)
        let hips = kinematics.hips
        let shoulders = kinematics.shoulders
        let squat = kinematics.squat
        
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        let armLen = scale * 0.55
        let legLen = scale * 0.60
        
        let headRad = scale * 0.16
        let leanAngle = -0.05 + squat * 0.10
        let headPos = CGPoint(
            x: shoulders.x + sin(CGFloat(leanAngle)) * headRad * 1.5,
            y: shoulders.y - cos(CGFloat(leanAngle)) * headRad * 1.5
        )
        
        func solveIK(start: CGPoint, target: CGPoint, len1: Double, len2: Double, flip: Bool) -> CGPoint {
            let dx = target.x - start.x
            let dy = target.y - start.y
            let dist = min(sqrt(dx*dx + dy*dy), len1 + len2 - 0.001)
            
            let a = len1
            let b = len2
            let c = dist
            
            let cosAngleC = (a*a + c*c - b*b) / (2 * a * c)
            let angleC = acos(max(-1, min(1, cosAngleC)))
            let baseAngle = atan2(dy, dx)
            
            let jointAngle = flip ? baseAngle - angleC : baseAngle + angleC
            return CGPoint(x: start.x + cos(CGFloat(jointAngle)) * len1, y: start.y + sin(CGFloat(jointAngle)) * len1)
        }
        
        let groundY = shiftedCenter.y + scale * 0.8
        let backFoot = CGPoint(x: shiftedCenter.x - scale * 0.6, y: groundY)
        let frontFoot = CGPoint(x: shiftedCenter.x - scale * 0.1, y: groundY)
        
        // legs
        let backKnee = solveIK(start: hips, target: backFoot, len1: legLen * 0.5, len2: legLen * 0.5, flip: true)
        let frontKnee = solveIK(start: hips, target: frontFoot, len1: legLen * 0.5, len2: legLen * 0.5, flip: true)
        
        func drawLimb(start: CGPoint, joint: CGPoint, end: CGPoint, color: Color, width: CGFloat) {
            var path = Path()
            path.move(to: start)
            path.addLine(to: joint)
            path.addLine(to: end)
            context.stroke(path, with: .color(color), style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
        }
        
        func getArmPositions(c: Double, k: (hips: CGPoint, shoulders: CGPoint, squat: Double, shootPhase: Double, dribbleArmAction: Double)) -> (frontElbow: CGPoint, frontHand: CGPoint, backElbow: CGPoint, backHand: CGPoint) {
            let baseUpperAngle: CGFloat = 0.8
            let shootUpperAngle: CGFloat = 2.4
            let baseElbowBend: CGFloat = 1.0
            let shootElbowBend: CGFloat = 0.2
            
            let upperAngle = baseUpperAngle + CGFloat(k.shootPhase) * (shootUpperAngle - baseUpperAngle) + CGFloat(k.dribbleArmAction) * 0.2
            let elbowAngle = upperAngle + baseElbowBend + CGFloat(k.shootPhase) * (shootElbowBend - baseElbowBend) - CGFloat(k.dribbleArmAction) * 0.4
            
            let frontElbow = CGPoint(x: k.shoulders.x + sin(CGFloat(upperAngle)) * armLen * 0.5, y: k.shoulders.y + cos(CGFloat(upperAngle)) * armLen * 0.5)
            let frontHand = CGPoint(x: frontElbow.x + sin(CGFloat(elbowAngle)) * armLen * 0.5, y: frontElbow.y + cos(CGFloat(elbowAngle)) * armLen * 0.5)
            
            let backUpperAngle = baseUpperAngle + 0.2 + CGFloat(k.shootPhase) * (shootUpperAngle - (baseUpperAngle + 0.2)) + CGFloat(k.dribbleArmAction) * 0.1
            let backElbowBend = baseElbowBend + 0.2 + CGFloat(k.shootPhase) * (shootElbowBend - (baseElbowBend + 0.2)) - CGFloat(k.dribbleArmAction) * 0.2
            
            let backElbow = CGPoint(x: k.shoulders.x + sin(CGFloat(backUpperAngle)) * armLen * 0.45, y: k.shoulders.y + cos(CGFloat(backUpperAngle)) * armLen * 0.45)
            let backHand = CGPoint(x: backElbow.x + sin(CGFloat(backUpperAngle + backElbowBend)) * armLen * 0.45, y: backElbow.y + cos(CGFloat(backUpperAngle + backElbowBend)) * armLen * 0.45)
            
            return (frontElbow, frontHand, backElbow, backHand)
        }
        
        let arms = getArmPositions(c: cycle, k: kinematics)
        
        // Back Layer
        drawLimb(start: shoulders, joint: arms.backElbow, end: arms.backHand, color: stickColor.opacity(0.4), width: 10)
        drawLimb(start: hips, joint: backKnee, end: backFoot, color: stickColor.opacity(0.4), width: 12)
        
        // Hoop (Front Facing & Higher)
        let hoopCenter = CGPoint(x: shiftedCenter.x + scale * 0.7, y: shiftedCenter.y - scale * 0.95)
        let hoopRadius = scale * 0.22
        
        // Backboard
        let backboardWidth = scale * 0.65
        let backboardHeight = scale * 0.45
        let backboardRect = CGRect(x: hoopCenter.x - backboardWidth / 2, y: hoopCenter.y - backboardHeight * 0.7, width: backboardWidth, height: backboardHeight)
        context.fill(Path(roundedRect: backboardRect, cornerRadius: 4), with: .color(stickColor.opacity(0.15)))
        context.stroke(Path(roundedRect: backboardRect, cornerRadius: 4), with: .color(stickColor), style: StrokeStyle(lineWidth: 3, lineCap: .round))
        
        let innerWidth = scale * 0.25
        let innerHeight = scale * 0.18
        let innerRect = CGRect(x: hoopCenter.x - innerWidth / 2, y: hoopCenter.y - innerHeight, width: innerWidth, height: innerHeight)
        context.stroke(Path(roundedRect: innerRect, cornerRadius: 2), with: .color(stickColor), style: StrokeStyle(lineWidth: 1.5))
        
        // Net
        var netPath = Path()
        let drop = scale * 0.3
        let innerRing = hoopRadius * 0.6
        netPath.move(to: CGPoint(x: hoopCenter.x - hoopRadius * 0.9, y: hoopCenter.y))
        netPath.addLine(to: CGPoint(x: hoopCenter.x - innerRing, y: hoopCenter.y + drop))
        netPath.addLine(to: CGPoint(x: hoopCenter.x + innerRing, y: hoopCenter.y + drop))
        netPath.addLine(to: CGPoint(x: hoopCenter.x + hoopRadius * 0.9, y: hoopCenter.y))
        context.stroke(netPath, with: .color(stickColor.opacity(0.6)), style: StrokeStyle(lineWidth: 2.5, lineCap: .round, lineJoin: .round))
        
        // Ring
        var ring = Path()
        ring.addEllipse(in: CGRect(x: hoopCenter.x - hoopRadius, y: hoopCenter.y - hoopRadius * 0.3, width: hoopRadius * 2, height: hoopRadius * 0.6))
        context.stroke(ring, with: .color(Color.red), style: StrokeStyle(lineWidth: 4.5))
        
        // Torso & Head
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara13_negro" : "cara13"))
            let imgSize = headRad * 4.76
            let rect = CGRect(
                x: headPos.x - imgSize/2,
                y: headPos.y - imgSize/2 - (headRad * 0.14),
                width: imgSize,
                height: imgSize
            )
            context.draw(headImage, in: rect)
        } else {
            context.fill(Path(ellipseIn: CGRect(x: headPos.x - headRad, y: headPos.y - headRad, width: headRad * 2, height: headRad * 2)), with: .color(stickColor))
        }
        
        var torsoPath = Path()
        torsoPath.move(to: shoulders)
        torsoPath.addLine(to: hips)
        context.stroke(torsoPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 13, lineCap: .round))
        
        // Front Layer
        drawLimb(start: hips, joint: frontKnee, end: frontFoot, color: stickColor, width: 12)
        drawLimb(start: shoulders, joint: arms.frontElbow, end: arms.frontHand, color: stickColor, width: 10)
        
        // Ball Physics
        let ballRad = scale * 0.14
        var ballPos = CGPoint.zero
        
        let r_k = getKinematics(c: releaseTime)
        let r_arms = getArmPositions(c: releaseTime, k: r_k)
        let releaseBallPos = CGPoint(x: r_arms.frontHand.x + ballRad * 0.8, y: r_arms.frontHand.y - ballRad * 0.8)
        
        let idealHandPos = CGPoint(x: arms.frontHand.x + ballRad * 0.8, y: arms.frontHand.y - ballRad * 0.8)
        let floorBounceY = groundY - ballRad
        
        if cycle < releaseTime {
            ballPos = idealHandPos
        } else if cycle < swishTime {
            let p = (cycle - releaseTime) / (swishTime - releaseTime)
            let targetX = hoopCenter.x
            let targetY = hoopCenter.y
            let curX = releaseBallPos.x + (targetX - releaseBallPos.x) * p
            let curY_base = releaseBallPos.y + (targetY - releaseBallPos.y) * p
            let arc = sin(CGFloat(p * .pi)) * (scale * 0.5)
            ballPos = CGPoint(x: curX, y: curY_base - arc)
        } else if cycle < floorTime {
            let p = (cycle - swishTime) / (floorTime - swishTime)
            let curX = hoopCenter.x
            let curY = hoopCenter.y + CGFloat(p * p) * (floorBounceY - hoopCenter.y)
            ballPos = CGPoint(x: curX, y: curY)
        } else if cycle < catchTime {
            let p = (cycle - floorTime) / (catchTime - floorTime)
            let startX = hoopCenter.x
            let startY = floorBounceY
            let endX = idealHandPos.x
            let endY = idealHandPos.y
            
            let curX = startX + (endX - startX) * p
            let easeOut = 1 - pow(1 - p, 2)
            let curY = startY + (endY - startY) * CGFloat(easeOut)
            ballPos = CGPoint(x: curX, y: curY)
        } else {
            let dribbleNorm = (cycle - catchTime) / (1.0 - catchTime)
            let localDribble = (dribbleNorm * 3).truncatingRemainder(dividingBy: 1.0)
            let bounceProgress = localDribble
            
            let dip = pow(2 * bounceProgress - 1, 2)
            let heightDiff = floorBounceY - idealHandPos.y
            let curY = floorBounceY - CGFloat(dip) * max(0, heightDiff)
            
            ballPos = CGPoint(x: idealHandPos.x, y: curY)
        }
        
        // Draw Ball
        let ballRect = CGRect(x: ballPos.x - ballRad, y: ballPos.y - ballRad, width: ballRad * 2, height: ballRad * 2)
        let orangeGradient = GraphicsContext.Shading.radialGradient(
            Gradient(colors: [Color(red: 1.0, green: 0.55, blue: 0.2), Color(red: 0.8, green: 0.3, blue: 0.0)]),
            center: CGPoint(x: ballPos.x - ballRad * 0.4, y: ballPos.y - ballRad * 0.4),
            startRadius: 0,
            endRadius: ballRad * 1.8
        )
        context.fill(Path(ellipseIn: ballRect), with: orangeGradient)
        
        let flyProgress = max(0, cycle - releaseTime)
        let ballRot = flyProgress * .pi * 8
        
        context.drawLayer { ctx in
            ctx.translateBy(x: ballPos.x, y: ballPos.y)
            ctx.rotate(by: Angle(radians: ballRot))
            ctx.translateBy(x: -ballPos.x, y: -ballPos.y)
            
            let strokeColor = Color.black.opacity(0.8)
            let strokeWidth = ballRad * 0.08
            
            var crossPath = Path()
            crossPath.move(to: CGPoint(x: ballPos.x - ballRad, y: ballPos.y))
            crossPath.addLine(to: CGPoint(x: ballPos.x + ballRad, y: ballPos.y))
            crossPath.move(to: CGPoint(x: ballPos.x, y: ballPos.y - ballRad))
            crossPath.addLine(to: CGPoint(x: ballPos.x, y: ballPos.y + ballRad))
            ctx.stroke(crossPath, with: .color(strokeColor), style: StrokeStyle(lineWidth: strokeWidth))
            
            var curvesPath = Path()
            let curveRadius = ballRad * 1.1
            curvesPath.addArc(center: CGPoint(x: ballPos.x - ballRad * 0.7, y: ballPos.y), radius: curveRadius, startAngle: .degrees(-45), endAngle: .degrees(45), clockwise: false)
            curvesPath.addArc(center: CGPoint(x: ballPos.x + ballRad * 0.7, y: ballPos.y), radius: curveRadius, startAngle: .degrees(135), endAngle: .degrees(225), clockwise: false)
            
            ctx.stroke(curvesPath, with: .color(strokeColor), style: StrokeStyle(lineWidth: strokeWidth))
            ctx.stroke(Path(ellipseIn: ballRect.insetBy(dx: ballRad * 0.1, dy: ballRad * 0.1)), with: .color(strokeColor.opacity(0.2)), style: StrokeStyle(lineWidth: 1))
        }
        
        // Shadows
        let sW = scale * 0.8
        let shadowRect = CGRect(x: shiftedCenter.x - scale * 0.35 - sW/2, y: groundY + 5, width: sW, height: 10)
        context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(0.3)))
        
        let ballHeight = (groundY - ballRad) - ballPos.y
        if ballPos.x > shiftedCenter.x - scale * 0.1 {
            let ballSW = max(10, ballRad * 1.5 - ballHeight * 0.1)
            let ballShadowRect = CGRect(x: ballPos.x - ballSW/2, y: groundY + 5, width: ballSW, height: 6)
            context.fill(Path(ellipseIn: ballShadowRect), with: .color(.black.opacity(0.3)))
        } else if cycle >= catchTime {
            let ballSW = max(10, ballRad * 1.5 - ballHeight * 0.1)
            let ballShadowRect = CGRect(x: ballPos.x - ballSW/2, y: groundY + 5, width: ballSW, height: 6)
            context.fill(Path(ellipseIn: ballShadowRect), with: .color(.black.opacity(0.3)))
        }
    }
}

#Preview {
    BasketballView()
        .preferredColorScheme(.dark)
}
