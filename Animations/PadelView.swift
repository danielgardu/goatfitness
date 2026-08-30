import SwiftUI
import Foundation
import CoreGraphics

struct PadelView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 0.42
    var isGoatMode: Bool = false
    
    struct PadelState {
        let shoulders: CGPoint
        let hips: CGPoint
        let headPos: CGPoint
        let headRad: CGFloat
        let handle: CGPoint
        let rAngle: CGFloat
        let racketDir: CGVector
        let leftHand: CGPoint
        let hitElbow: CGPoint
        let leftElbow: CGPoint
        let backKnee: CGPoint
        let frontKnee: CGPoint
        let backFoot: CGPoint
        let frontFoot: CGPoint
        let ballP: CGPoint?
        let ballRad: CGFloat
        let lean: CGFloat
        let groundY: CGFloat
        let impactPower: CGFloat // 0..1 for impact effects
    }
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate * speed
                self.drawPadel(into: &context, size: size, time: t)
            }
        }
    }
    
    private func getPadelState(cycle: Double, scale: CGFloat, center: CGPoint) -> PadelState {
        let c = cycle.truncatingRemainder(dividingBy: 1.0)
        
        let prepPhase = smoothStep(phase(c, 0.0, 0.25))
        let backPhase = smoothStep(phase(c, 0.25, 0.45))
        let swingPhase = smoothStep(phase(c, 0.45, 0.65))
        let followPhase = smoothStep(phase(c, 0.65, 0.85))
        let recoverPhase = smoothStep(phase(c, 0.85, 1.0))
        
        func keyPose(_ p0: CGFloat, _ p1: CGFloat, _ p2: CGFloat, _ p3: CGFloat, _ p4: CGFloat) -> CGFloat {
            if c < 0.25 { return lerp(p0, p1, prepPhase) }
            if c < 0.45 { return lerp(p1, p2, backPhase) }
            if c < 0.65 { return lerp(p2, p3, swingPhase) }
            if c < 0.85 { return lerp(p3, p4, followPhase) }
            return lerp(p4, p0, recoverPhase)
        }
        
        let groundY = center.y + scale * 0.72
        let hipsBase = CGPoint(x: center.x, y: groundY - scale * 0.50)
        let hipsX = keyPose(0.0, -scale * 0.05, -scale * 0.15, scale * 0.15, scale * 0.05)
        let impactRecoil = c >= 0.58 && c < 0.65 ? -scale * 0.02 : 0.0
        let hipsY = keyPose(0.0, scale * 0.02, scale * 0.08, scale * 0.05, 0.0)
        let hips = CGPoint(x: hipsBase.x + hipsX + impactRecoil, y: hipsBase.y + hipsY)
        
        let lean = keyPose(0.05, -0.05, -0.15, 0.25, 0.15)
        let torsoLen = scale * 0.50
        let shoulders = CGPoint(x: hips.x + sin(lean) * torsoLen, y: hips.y - cos(lean) * torsoLen)
        
        let headRad = scale * 0.15
        
        // Arm logic
        let handleX = keyPose(scale * 0.2, scale * 0.1, -scale * 0.4, scale * 0.5, scale * 0.4)
        let handleY = keyPose(scale * 0.3, scale * 0.4, scale * 0.1, scale * 0.0, scale * 0.1)
        let handle = CGPoint(x: shoulders.x + handleX, y: shoulders.y + handleY)
        let rAngle = stagedRacketAngle(cycle: c)
        let racketDir = CGVector(dx: cos(rAngle), dy: sin(rAngle))
        
        let upperArm = scale * 0.28
        let forearm = scale * 0.28
        
        let hitBendSignThreshold = scale * 0.05
        let hitBendSign: CGFloat = {
            if handleX > hitBendSignThreshold { return 1.0 }
            if handleX < -hitBendSignThreshold { return -1.0 }
            let t = (handleX + hitBendSignThreshold) / (hitBendSignThreshold * 2)
            return -1.0 + (Double(t) * 2.0)
        }()
        let hitElbow = solveJoint(start: shoulders, end: handle, len1: upperArm, len2: forearm, bendSign: hitBendSign)
        
        let leftHandX = keyPose(scale * 0.2, scale * 0.3, -scale * 0.4, -scale * 0.5, -scale * 0.2)
        let leftHandY = keyPose(-scale * 0.3, -scale * 0.4, scale * 0.1, scale * 0.2, -scale * 0.1)
        let leftHand = CGPoint(x: shoulders.x + leftHandX, y: shoulders.y + leftHandY)
        let leftElbow = solveJoint(start: shoulders, end: leftHand, len1: upperArm, len2: forearm, bendSign: -1)
        
        // Legs
        let backFoot = CGPoint(x: keyPose(center.x - scale * 0.3, center.x - scale * 0.35, center.x - scale * 0.4, center.x - scale * 0.1, center.x - scale * 0.2), y: groundY)
        let frontFoot = CGPoint(x: keyPose(center.x + scale * 0.2, center.x + scale * 0.1, center.x + scale * 0.05, center.x + scale * 0.4, center.x + scale * 0.3), y: groundY)
        let upperLeg = scale * 0.32
        let lowerLeg = scale * 0.32
        let backKnee = solveJoint(start: hips, end: backFoot, len1: upperLeg, len2: lowerLeg, bendSign: -1)
        let frontKnee = solveJoint(start: hips, end: frontFoot, len1: upperLeg, len2: lowerLeg, bendSign: -1)
        
        // Ball logic
        let contactTime = 0.58
        let ballStart = 0.35
        let ballEnd = 0.85
        let ballRad = scale * 0.06
        var ballP: CGPoint? = nil
        if c >= ballStart && c < ballEnd {
            let ballContactPhase = phase(c, ballStart, contactTime)
            let ballPostContactPhase = phase(c, contactTime, ballEnd)
            if c < contactTime {
                let startP = CGPoint(x: center.x + scale * 1.5, y: center.y)
                let endP = handle.translated(dx: racketDir.dx * scale * 0.5, dy: racketDir.dy * scale * 0.5)
                let baseP = lerpPoint(startP, endP, smoothStep(ballContactPhase))
                let arcY = -scale * 0.15 * sin(ballContactPhase * .pi)
                ballP = CGPoint(x: baseP.x, y: baseP.y + arcY)
            } else {
                let startP = handle.translated(dx: racketDir.dx * scale * 0.5, dy: racketDir.dy * scale * 0.5)
                let endP = CGPoint(x: center.x + scale * 2.8, y: center.y - scale * 1.0)
                let baseP = lerpPoint(startP, endP, ballPostContactPhase)
                let arcY = -scale * 0.20 * sin(ballPostContactPhase * .pi)
                ballP = CGPoint(x: baseP.x, y: baseP.y + arcY)
            }
        }
        
        // Head position (fixed with torso lean)
        let headPos = CGPoint(
            x: shoulders.x + sin(lean - 0.05) * headRad * 1.4,
            y: shoulders.y - cos(lean - 0.05) * headRad * 1.4
        )
        
        let impactPower = c >= 0.58 && c < 0.65 ? smoothStep(phase(c, 0.58, 0.65)) : 0.0
        
        return PadelState(
            shoulders: shoulders, hips: hips, headPos: headPos, headRad: headRad,
            handle: handle, rAngle: rAngle, racketDir: racketDir,
            leftHand: leftHand, hitElbow: hitElbow, leftElbow: leftElbow,
            backKnee: backKnee, frontKnee: frontKnee, backFoot: backFoot, frontFoot: frontFoot,
            ballP: ballP, ballRad: ballRad, lean: lean, groundY: groundY, impactPower: impactPower
        )
    }
    
    private func drawPadel(into context: inout GraphicsContext, size: CGSize, time t: Double) {
        let cycle = t.truncatingRemainder(dividingBy: 1.0)
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let scale = min(size.width, size.height) * 0.40
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        let ballColor = Color(red: 0.85, green: 1.0, blue: 0.1)
        let racketColor = Color(red: 0.05, green: 0.25, blue: 0.65) // Dark blue racket
        
        let state = getPadelState(cycle: cycle, scale: scale, center: center)
        
        // --- 1. Environment & Court ---
        drawEnvironment(context, center, scale, groundY: state.groundY)
        
        // --- 2. Motion Trails (VFX) ---
        for i in 1...2 {
            let ghostTime = t - Double(i) * 0.015
            let gCycle = ghostTime.truncatingRemainder(dividingBy: 1.0)
            let gState = getPadelState(cycle: gCycle, scale: scale, center: center)
            let opacity = 0.2 - Double(i) * 0.08
            if let gBall = gState.ballP {
                context.fill(Path(ellipseIn: CGRect(x: gBall.x - state.ballRad, y: gBall.y - state.ballRad, width: state.ballRad * 2, height: state.ballRad * 2)), with: .color(ballColor.opacity(opacity)))
            }
            drawRacket(context, handle: gState.handle, rAngle: gState.rAngle, racketDir: gState.racketDir, scale: scale, color: racketColor.opacity(opacity), isGhost: true)
        }
        
        // --- 3. Stickman ---
        drawLimb(context, state.shoulders, state.leftElbow, state.leftHand, color: stickColor.opacity(0.35), width: 10)
        drawLimb(context, state.hips, state.backKnee, state.backFoot, color: stickColor.opacity(0.2), width: 12)
        
        let hitArmBehind = (state.handle.x - state.shoulders.x) < 0
        if hitArmBehind {
            drawLimb(context, state.shoulders, state.hitElbow, state.handle, color: stickColor, width: 10)
        }
        
        let angle = state.lean
        let shoulderWidth = 14.0 * cos(angle * 2.0)
        var torsoPath = Path()
        torsoPath.move(to: state.shoulders)
        torsoPath.addLine(to: state.hips)
        context.stroke(torsoPath, with: .color(stickColor), style: StrokeStyle(lineWidth: CGFloat(shoulderWidth), lineCap: .round))
        
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara1_negro" : "cara1"))
            let imgSize = state.headRad * 4.76
            let rect = CGRect(
                x: state.headPos.x - imgSize/2,
                y: state.headPos.y - imgSize/2 - (state.headRad * 0.14),
                width: imgSize,
                height: imgSize
            )
            context.draw(headImage, in: rect)
        } else {
            context.fill(Path(ellipseIn: CGRect(x: state.headPos.x - state.headRad, y: state.headPos.y - state.headRad, width: state.headRad * 2, height: state.headRad * 2)), with: .color(stickColor))
        }
        
        drawLimb(context, state.hips, state.frontKnee, state.frontFoot, color: stickColor, width: 12)
        if !hitArmBehind {
            drawLimb(context, state.shoulders, state.hitElbow, state.handle, color: stickColor, width: 10)
        }
        
        // --- 4. Racket ---
        drawRacket(context, handle: state.handle, rAngle: state.rAngle, racketDir: state.racketDir, scale: scale, color: racketColor, isGhost: false)
        
        // --- 5. Ball & Impact ---
        if let ballP = state.ballP {
            context.drawLayer { g in
                g.addFilter(.blur(radius: 4))
                g.fill(Path(ellipseIn: CGRect(x: ballP.x - state.ballRad * 1.2, y: ballP.y - state.ballRad * 1.2, width: state.ballRad * 2.4, height: state.ballRad * 2.4)), with: .color(ballColor.opacity(0.3)))
            }
            context.fill(Path(ellipseIn: CGRect(x: ballP.x - state.ballRad, y: ballP.y - state.ballRad, width: state.ballRad * 2, height: state.ballRad * 2)), with: .color(ballColor))
            
            let h = max(0, state.groundY - ballP.y)
            let shadowW = max(4.0, state.ballRad * 1.8 - h * 0.1)
            context.fill(Path(ellipseIn: CGRect(x: ballP.x - shadowW/2, y: state.groundY + 4, width: shadowW, height: 4)), with: .color(.black.opacity(0.2)))
        }
        
        if state.impactPower > 0 {
            let p = state.handle.translated(dx: state.racketDir.dx * scale * 0.5, dy: state.racketDir.dy * scale * 0.5)
            let flashRad = scale * 0.2 * state.impactPower
            context.drawLayer { g in
                g.addFilter(.blur(radius: 10))
                g.fill(Path(ellipseIn: CGRect(x: p.x - flashRad, y: p.y - flashRad, width: flashRad * 2, height: flashRad * 2)), with: .color(Color.yellow.opacity(0.4 * (1.0 - Double(state.impactPower)))))
            }
        }
        
        let shadowW = scale * 1.2
        context.fill(Path(ellipseIn: CGRect(x: center.x - shadowW/2 + (state.hips.x - center.x) * 0.5, y: state.groundY + 8, width: shadowW, height: 8)), with: .color(.black.opacity(0.15)))
    }
    
    private func drawEnvironment(_ context: GraphicsContext, _ center: CGPoint, _ scale: CGFloat, groundY: CGFloat) {
        var line = Path()
        line.move(to: CGPoint(x: center.x - scale * 1.5, y: groundY + 12))
        line.addLine(to: CGPoint(x: center.x + scale * 1.5, y: groundY + 12))
        context.stroke(line, with: .color((colorMode == .darkStickman ? Color.black : Color.white).opacity(0.1)), style: StrokeStyle(lineWidth: 1))
    }
    
    private func drawRacket(_ context: GraphicsContext, handle: CGPoint, rAngle: CGFloat, racketDir: CGVector, scale: CGFloat, color: Color, isGhost: Bool) {
        let racketLen = scale * 0.65
        let headStart = handle.x + racketDir.dx * scale * 0.20
        let headStartY = handle.y + racketDir.dy * scale * 0.20
        let headEnd = handle.x + racketDir.dx * racketLen
        let headEndY = handle.y + racketDir.dy * racketLen
        
        var handlePath = Path()
        handlePath.move(to: handle)
        handlePath.addLine(to: CGPoint(x: headStart, y: headStartY))
        context.stroke(handlePath, with: .color(color), style: StrokeStyle(lineWidth: isGhost ? 4 : 8, lineCap: .round))
        
        let headCenter = CGPoint(x: (headStart + headEnd) / 2, y: (headStartY + headEndY) / 2)
        let headWidth = scale * 0.35
        let headHeight = scale * 0.25
        let racketTransform = CGAffineTransform.identity.translatedBy(x: headCenter.x, y: headCenter.y).rotated(by: rAngle)
        
        // Racket Head Outer Rim
        context.stroke(
            Path(ellipseIn: CGRect(x: -headWidth/2, y: -headHeight/2, width: headWidth, height: headHeight)).applying(racketTransform),
            with: .color(color),
            style: StrokeStyle(lineWidth: isGhost ? 3 : 6)
        )
        
        if !isGhost {
            // Draw solid paddle body inside a separate layer to cut hole circles out of it
            context.drawLayer { layerContext in
                // Fill paddle body with dark blue (semi-opaque)
                layerContext.fill(
                    Path(ellipseIn: CGRect(x: -headWidth/2, y: -headHeight/2, width: headWidth, height: headHeight)).applying(racketTransform),
                    with: .color(color.opacity(0.6))
                )
                
                // Punch holes
                layerContext.blendMode = .clear
                
                let holeRadius = headHeight * 0.045
                let positions: [CGPoint] = [
                    CGPoint(x: -headWidth * 0.2, y: -headHeight * 0.15),
                    CGPoint(x: -headWidth * 0.2, y: headHeight * 0.15),
                    CGPoint(x: -headWidth * 0.1, y: 0),
                    CGPoint(x: 0, y: -headHeight * 0.15),
                    CGPoint(x: 0, y: 0),
                    CGPoint(x: 0, y: headHeight * 0.15),
                    CGPoint(x: headWidth * 0.1, y: 0),
                    CGPoint(x: headWidth * 0.2, y: -headHeight * 0.15),
                    CGPoint(x: headWidth * 0.2, y: headHeight * 0.15)
                ]
                for pos in positions {
                    let holePath = Path(ellipseIn: CGRect(x: pos.x - holeRadius, y: pos.y - holeRadius, width: holeRadius * 2, height: holeRadius * 2))
                    layerContext.fill(holePath.applying(racketTransform), with: .color(.black))
                }
            }
        }
    }
    
    private func stagedRacketAngle(cycle: Double) -> CGFloat {
        let start: CGFloat = -0.8
        let back: CGFloat = -1.57
        let hit: CGFloat = -4.71
        let follow: CGFloat = -5.4
        let prepP = smoothStep(phase(cycle, 0.0, 0.25))
        let backP = smoothStep(phase(cycle, 0.25, 0.45))
        let swingP = smoothStep(phase(cycle, 0.45, 0.65))
        let followP = smoothStep(phase(cycle, 0.65, 0.85))
        let recoverP = smoothStep(phase(cycle, 0.85, 1.0))
        if cycle < 0.25 { return lerp(start, back, prepP) }
        if cycle < 0.45 { return lerp(back, back - 0.2, backP) }
        if cycle < 0.65 { return lerp(back - 0.2, hit, swingP) }
        if cycle < 0.85 { return lerp(hit, follow, followP) }
        return lerp(follow, start, recoverP)
    }
    
    private func phase(_ cycle: Double, _ start: Double, _ end: Double) -> Double {
        if cycle <= start { return 0.0 }
        if cycle >= end { return 1.0 }
        return (cycle - start) / (end - start)
    }
    private func smoothStep(_ value: Double) -> Double {
        let u = min(1.0, max(0.0, value))
        return u * u * (3.0 - 2.0 * u)
    }
    private func lerp(_ a: CGFloat, _ b: CGFloat, _ t: Double) -> CGFloat { a + (b - a) * CGFloat(t) }
    private func lerpPoint(_ a: CGPoint, _ b: CGPoint, _ t: Double) -> CGPoint { CGPoint(x: a.x + (b.x - a.x) * CGFloat(t), y: a.y + (b.y - a.y) * CGFloat(t)) }
    private func solveJoint(start: CGPoint, end: CGPoint, len1: CGFloat, len2: CGFloat, bendSign: CGFloat) -> CGPoint {
        let dx = end.x - start.x; let dy = end.y - start.y; let distRaw = sqrt(dx * dx + dy * dy); let dist = max(0.0001, min(distRaw, len1 + len2 - 0.001))
        let base = atan2(dy, dx); let cosA = (len1 * len1 + dist * dist - len2 * len2) / (2 * len1 * dist); let angleA = acos(max(-1, min(1, cosA)))
        let jointAngle = base + bendSign * angleA
        return CGPoint(x: start.x + cos(jointAngle) * len1, y: start.y + sin(jointAngle) * len1)
    }
    private func drawLimb(_ context: GraphicsContext, _ p1: CGPoint, _ p2: CGPoint, _ p3: CGPoint, color: Color, width: CGFloat) {
        var path = Path(); path.move(to: p1); path.addLine(to: p2); path.addLine(to: p3); context.stroke(path, with: .color(color), style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
    }
}
