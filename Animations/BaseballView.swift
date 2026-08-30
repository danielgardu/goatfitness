import SwiftUI
import Foundation

struct BaseballView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 0.42
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate * speed
                self.drawBaseball(into: &context, size: size, time: t)
            }
        }
    }
    
    private func drawBaseball(into context: inout GraphicsContext, size: CGSize, time t: Double) {
        let c = t.truncatingRemainder(dividingBy: 1.0)
        
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let scale = min(size.width, size.height) * 0.40
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        let batColor = Color(red: 0.08, green: 0.70, blue: 0.95)
        
        let loadPhase = smoothStep(phase(c, 0.22, 0.40))
        let swingPhase = smoothStep(phase(c, 0.40, 0.60))
        let followPhase = smoothStep(phase(c, 0.60, 0.74))
        let recoverPhase = smoothStep(phase(c, 0.74, 1.00))
        
        let breathe = sin(c * .pi * 2.0) * 0.008
        
        func keyPose(_ stance: CGFloat, _ load: CGFloat, _ contact: CGFloat, _ follow: CGFloat) -> CGFloat {
            if c < 0.22 { return stance }
            if c < 0.40 { return lerp(stance, load, loadPhase) }
            if c < 0.60 { return lerp(load, contact, swingPhase) }
            if c < 0.74 { return lerp(contact, follow, followPhase) }
            return lerp(follow, stance, recoverPhase)
        }
        
        let swingProgress = phase(c, 0.40, 0.60)
        let swingUDip = (c >= 0.40 && c < 0.60) ? sin(CGFloat(swingProgress * .pi)) * scale * 0.018 : 0.0
        
        let groundY = center.y + scale * 0.72
        let hipsBase = CGPoint(x: center.x - scale * 0.03, y: groundY - scale * 0.50)
        let hipsXOffset = keyPose(0.0, -scale * 0.09, scale * 0.17, scale * 0.11)
        let hipsYOffset = keyPose(0.0, scale * 0.06, -scale * 0.04, scale * 0.01)
        
        let hips = CGPoint(
            x: hipsBase.x + hipsXOffset,
            y: hipsBase.y + hipsYOffset + CGFloat(breathe) * scale
        )
        
        let torsoLen = scale * 0.46
        let lean = keyPose(-0.04, -0.22, 0.16, 0.08)
        let shoulders = CGPoint(
            x: hips.x + sin(lean) * torsoLen,
            y: hips.y - cos(lean) * torsoLen
        )
        
        let headRad = scale * 0.15
        let headPos = CGPoint(
            x: shoulders.x + sin(lean - 0.08) * headRad * 1.35,
            y: shoulders.y - cos(lean - 0.08) * headRad * 1.35 + CGFloat(breathe) * scale * 0.5
        )
        
        let backFoot = CGPoint(
            x: keyPose(center.x - scale * 0.25, center.x - scale * 0.26, center.x - scale * 0.22, center.x - scale * 0.20),
            y: keyPose(groundY, groundY, groundY, groundY - scale * 0.02)
        )
        
        let frontFoot = CGPoint(
            x: keyPose(center.x + scale * 0.24, center.x + scale * 0.21, center.x + scale * 0.27, center.x + scale * 0.31),
            y: keyPose(groundY, groundY - scale * 0.05, groundY, groundY)
        )
        
        let thighLen = scale * 0.30
        let shinLen = scale * 0.31
        let backKnee = solveJoint(start: hips, end: backFoot, len1: thighLen, len2: shinLen, bendSign: -1)
        let frontKnee = solveJoint(start: hips, end: frontFoot, len1: thighLen, len2: shinLen, bendSign: -1)
        
        var handleYOffset = keyPose(scale * 0.19, scale * 0.22, scale * 0.15, scale * 0.15) + swingUDip
        var handleXOffset = keyPose(scale * 0.03, -scale * 0.01, scale * 0.22, scale * 0.18)
        
        // Swing arc in "U" (baseball): drop to slot, then level through the zone.
        if c >= 0.40 && c < 0.60 {
            let toSlot = smoothStep(phase(c, 0.40, 0.48))
            let throughZone = smoothStep(phase(c, 0.48, 0.60))
            
            if c < 0.48 {
                handleXOffset = lerp(-scale * 0.08, scale * 0.02, toSlot)
                handleYOffset = lerp(scale * 0.21, scale * 0.30, toSlot)
            } else {
                handleXOffset = lerp(scale * 0.02, scale * 0.22, throughZone)
                handleYOffset = lerp(scale * 0.30, scale * 0.27, throughZone)
            }
        }
        
        let handle = CGPoint(
            x: shoulders.x + handleXOffset,
            y: shoulders.y + handleYOffset
        )
        
        var batAngle = stagedBatAngle(cycle: c)
        
        // Force bat-tip track to waist-level baseball "U": drop to slot, then flat through zone.
        if c >= 0.40 && c < 0.60 {
            let toSlot = smoothStep(phase(c, 0.40, 0.50))
            let throughZone = smoothStep(phase(c, 0.50, 0.60))
            let tipX: CGFloat
            let tipY: CGFloat
            
            if c < 0.50 {
                tipX = lerp(center.x - scale * 0.35, center.x + scale * 0.00, toSlot)
                tipY = lerp(center.y + scale * 0.35, center.y + scale * 0.28, toSlot)
            } else {
                tipX = lerp(center.x + scale * 0.00, center.x + scale * 0.58, throughZone)
                tipY = lerp(center.y + scale * 0.28, center.y + scale * 0.27, throughZone)
            }
            
            batAngle = atan2(tipY - handle.y, tipX - handle.x)
        }
        
        let batDir = CGVector(dx: cos(batAngle), dy: sin(batAngle))
        let batPerp = CGVector(dx: -batDir.dy, dy: batDir.dx)
        
        let frontHand = CGPoint(
            x: handle.x + batDir.dx * scale * 0.045,
            y: handle.y + batDir.dy * scale * 0.045
        )
        
        let backHand = CGPoint(
            x: handle.x + batDir.dx * scale * 0.015 + batPerp.dx * scale * 0.010,
            y: handle.y + batDir.dy * scale * 0.015 + batPerp.dy * scale * 0.010
        )
        
        let frontShoulder = CGPoint(x: shoulders.x + scale * 0.015, y: shoulders.y + scale * 0.005)
        let backShoulder = CGPoint(x: shoulders.x - scale * 0.030, y: shoulders.y - scale * 0.006)
        
        let upperArm = scale * 0.26
        let forearm = scale * 0.26
        let armFlipBlend: Double = {
            if c < 0.60 { return 0.0 }
            if c < 0.78 { return smoothStep(phase(c, 0.60, 0.78)) }
            if c < 0.86 { return 1.0 }
            return 1.0 - smoothStep(phase(c, 0.86, 1.00))
        }()
        
        let frontElbowIn = solveJoint(start: frontShoulder, end: frontHand, len1: upperArm, len2: forearm, bendSign: -1)
        let frontElbowOut = solveJoint(start: frontShoulder, end: frontHand, len1: upperArm, len2: forearm, bendSign: 1)
        let frontElbow = lerpPoint(frontElbowIn, frontElbowOut, armFlipBlend)
        
        let backElbowIn = solveJoint(start: backShoulder, end: backHand, len1: upperArm, len2: forearm, bendSign: 1)
        let backElbowOut = solveJoint(start: backShoulder, end: backHand, len1: upperArm, len2: forearm, bendSign: -1)
        let backElbow = lerpPoint(backElbowIn, backElbowOut, armFlipBlend)
        
        // Back layer
        drawLimb(context, backShoulder, backElbow, backHand, color: stickColor.opacity(0.35), width: 10)
        drawLimb(context, hips, backKnee, backFoot, color: stickColor.opacity(0.35), width: 12)
        
        // Torso + head
        var torsoPath = Path()
        torsoPath.move(to: shoulders)
        torsoPath.addLine(to: hips)
        context.stroke(torsoPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 13, lineCap: .round))
        
        // Head (Goat Mode Support - Baseball uses cara1.png)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara1_negro" : "cara1"))
            let imgSize = headRad * 4.76 // 70% larger than 2.8x (standard for cara6) but let's stick to the 70% increase logic: 2.8 * 1.7 = 4.76
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
                    x: headPos.x - headRad,
                    y: headPos.y - headRad,
                    width: headRad * 2,
                    height: headRad * 2
                )),
                with: .color(stickColor)
            )
        }
        
        // Front layer
        drawLimb(context, hips, frontKnee, frontFoot, color: stickColor, width: 12)
        drawLimb(context, frontShoulder, frontElbow, frontHand, color: stickColor, width: 10)
        
        // Bat (handle + barrel)
        let batLength = scale * 0.62
        let batMid = CGPoint(
            x: handle.x + batDir.dx * batLength * 0.45,
            y: handle.y + batDir.dy * batLength * 0.45
        )
        let batTip = CGPoint(
            x: handle.x + batDir.dx * batLength,
            y: handle.y + batDir.dy * batLength
        )
        
        var handlePath = Path()
        handlePath.move(to: handle)
        handlePath.addLine(to: batMid)
        context.stroke(handlePath, with: .color(batColor), style: StrokeStyle(lineWidth: 8, lineCap: .round))
        
        var barrelPath = Path()
        barrelPath.move(to: batMid)
        barrelPath.addLine(to: batTip)
        context.stroke(barrelPath, with: .color(batColor), style: StrokeStyle(lineWidth: 12, lineCap: .round))
        
        context.fill(
            Path(ellipseIn: CGRect(x: batTip.x - 7, y: batTip.y - 7, width: 14, height: 14)),
            with: .color(batColor.opacity(0.95))
        )
        
        // Grip wraps
        for i in 0..<3 {
            let d = CGFloat(i) * scale * 0.018 + scale * 0.018
            let p = CGPoint(x: handle.x + batDir.dx * d, y: handle.y + batDir.dy * d)
            let q = CGPoint(
                x: p.x + batPerp.dx * scale * 0.016,
                y: p.y + batPerp.dy * scale * 0.016
            )
            var grip = Path()
            grip.move(to: p)
            grip.addLine(to: q)
            context.stroke(grip, with: .color((colorMode == .darkStickman ? Color.black : Color.white).opacity(0.85)), style: StrokeStyle(lineWidth: 1.5, lineCap: .round))
        }
        
        // Ball flight: pitch from right -> hit -> arc away
        let pitchStart = 0.30
        let contactTime = 0.59
        let exitEnd = 0.80
        
        let contactPoint = CGPoint(
            x: center.x + scale * 0.60,
            y: center.y + scale * 0.27
        )
        
        let pitchOrigin = CGPoint(x: center.x + scale * 1.30, y: center.y + scale * 0.10)
        let exitTarget = CGPoint(x: center.x + scale * 1.55, y: contactPoint.y)
        
        let ballRad = scale * 0.055
        var ballPos: CGPoint?
        
        if c >= pitchStart && c < contactTime {
            let p = smoothStep(phase(c, pitchStart, contactTime))
            var candidate = lerpPoint(pitchOrigin, contactPoint, p)
            candidate.y += sin(CGFloat(p * .pi)) * scale * 0.015
            ballPos = candidate
        } else if c >= contactTime && c < exitEnd {
            let p = phase(c, contactTime, exitEnd)
            let x = contactPoint.x + (exitTarget.x - contactPoint.x) * CGFloat(p)
            let yBase = contactPoint.y + (exitTarget.y - contactPoint.y) * CGFloat(p)
            ballPos = CGPoint(x: x, y: yBase)
        }
        
        if let ball = ballPos {
            context.fill(
                Path(ellipseIn: CGRect(x: ball.x - ballRad, y: ball.y - ballRad, width: ballRad * 2, height: ballRad * 2)),
                with: .color((colorMode == .darkStickman ? Color.black : Color.white).opacity(0.98))
            )
            
            var seam1 = Path()
            seam1.move(to: CGPoint(x: ball.x - ballRad * 0.45, y: ball.y - ballRad * 0.12))
            seam1.addQuadCurve(
                to: CGPoint(x: ball.x + ballRad * 0.45, y: ball.y + ballRad * 0.12),
                control: CGPoint(x: ball.x, y: ball.y - ballRad * 0.42)
            )
            context.stroke(seam1, with: .color(.black.opacity(0.35)), style: StrokeStyle(lineWidth: 1.0, lineCap: .round))
            
            let h = max(0, groundY - ball.y)
            let shadowW = max(4.0, ballRad * 1.7 - h * 0.09)
            let shadowRect = CGRect(x: ball.x - shadowW / 2, y: groundY + 4, width: shadowW, height: 4)
            context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(0.20)))
        }
        
        // Ground shadow
        let bodyDrive = (hips.x - hipsBase.x) / scale
        let shadowW = scale * (1.32 - abs(bodyDrive) * 0.08)
        let shadowRect = CGRect(
            x: center.x - shadowW / 2 + bodyDrive * scale * 0.25,
            y: groundY + 6,
            width: shadowW,
            height: 7
        )
        context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(0.18)))
    }
    
    private func clamp01(_ value: Double) -> Double {
        min(1.0, max(0.0, value))
    }
    
    private func smoothStep(_ value: Double) -> Double {
        let u = clamp01(value)
        return u * u * (3.0 - 2.0 * u)
    }
    
    private func phase(_ cycle: Double, _ start: Double, _ end: Double) -> Double {
        if cycle <= start { return 0.0 }
        if cycle >= end { return 1.0 }
        return (cycle - start) / (end - start)
    }
    
    private func lerp(_ a: CGFloat, _ b: CGFloat, _ t: Double) -> CGFloat {
        a + (b - a) * CGFloat(t)
    }
    
    private func lerpPoint(_ a: CGPoint, _ b: CGPoint, _ t: Double) -> CGPoint {
        CGPoint(
            x: a.x + (b.x - a.x) * CGFloat(t),
            y: a.y + (b.y - a.y) * CGFloat(t)
        )
    }
    
    private func solveJoint(start: CGPoint, end: CGPoint, len1: CGFloat, len2: CGFloat, bendSign: CGFloat) -> CGPoint {
        let dx = end.x - start.x
        let dy = end.y - start.y
        let distRaw = sqrt(dx * dx + dy * dy)
        let dist = max(0.0001, min(distRaw, len1 + len2 - 0.001))
        
        let base = atan2(dy, dx)
        let cosA = (len1 * len1 + dist * dist - len2 * len2) / (2 * len1 * dist)
        let angleA = acos(max(-1, min(1, cosA)))
        let jointAngle = base + bendSign * angleA
        
        return CGPoint(
            x: start.x + cos(jointAngle) * len1,
            y: start.y + sin(jointAngle) * len1
        )
    }
    
    private func drawLimb(_ context: GraphicsContext, _ p1: CGPoint, _ p2: CGPoint, _ p3: CGPoint, color: Color, width: CGFloat) {
        var path = Path()
        path.move(to: p1)
        path.addLine(to: p2)
        path.addLine(to: p3)
        context.stroke(
            path,
            with: .color(color),
            style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round)
        )
    }
    
    private func stagedBatAngle(cycle: Double) -> CGFloat {
        let stance: CGFloat = -1.95
        let load: CGFloat = -2.02
        let contact: CGFloat = -0.06
        let follow: CGFloat = 0.10
        
        if cycle < 0.22 { return stance }
        if cycle < 0.40 {
            let p = smoothStep(phase(cycle, 0.22, 0.40))
            return lerp(stance, load, p)
        }
        if cycle < 0.60 {
            let toSlot = smoothStep(phase(cycle, 0.40, 0.48))
            let throughZone = smoothStep(phase(cycle, 0.48, 0.60))
            if cycle < 0.48 {
                return lerp(load, -0.42, toSlot)
            } else {
                return lerp(-0.42, contact, throughZone)
            }
        }
        if cycle < 0.74 {
            let p = smoothStep(phase(cycle, 0.60, 0.74))
            return lerp(contact, follow, p)
        }
        let p = smoothStep(phase(cycle, 0.74, 1.00))
        return lerp(follow, stance, p)
    }
    
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        BaseballView()
            .frame(width: 320, height: 240)
    }
}
