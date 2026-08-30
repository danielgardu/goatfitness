import SwiftUI
import Foundation
import CoreGraphics

struct PingPongView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 0.55
    var isGoatMode: Bool = false
    
    struct PingPongState {
        let shoulders: CGPoint
        let hips: CGPoint
        let headPos: CGPoint
        let headRad: CGFloat
        let handle: CGPoint
        let pAngle: CGFloat
        let paddleDir: CGVector
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
        let impactPower: CGFloat
    }
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate * speed
                self.drawPingPong(into: &context, size: size, time: t)
            }
        }
    }
    
    private func getPingPongState(cycle: Double, scale: CGFloat, center: CGPoint) -> PingPongState {
        let c = cycle.truncatingRemainder(dividingBy: 1.0)
        
        // Phases for a quick ping pong stroke
        let prepPhase = smoothStep(phase(c, 0.0, 0.2))
        let backPhase = smoothStep(phase(c, 0.2, 0.35))
        let swingPhase = smoothStep(phase(c, 0.35, 0.5))
        let followPhase = smoothStep(phase(c, 0.5, 0.7))
        let recoverPhase = smoothStep(phase(c, 0.7, 1.0))
        
        func keyPose(_ p0: CGFloat, _ p1: CGFloat, _ p2: CGFloat, _ p3: CGFloat, _ p4: CGFloat) -> CGFloat {
            if c < 0.2 { return lerp(p0, p1, prepPhase) }
            if c < 0.35 { return lerp(p1, p2, backPhase) }
            if c < 0.5 { return lerp(p2, p3, swingPhase) }
            if c < 0.7 { return lerp(p3, p4, followPhase) }
            return lerp(p4, p0, recoverPhase)
        }
        
        let groundY = center.y + scale * 0.72
        let tableTopY = center.y + scale * 0.15
        
        // Ping pong players are usually more crouched, but here we stand them up a bit
        let hipsBase = CGPoint(x: center.x - scale * 0.5, y: groundY - scale * 0.39)
        let hipsX = keyPose(0.0, -scale * 0.05, -scale * 0.1, scale * 0.1, scale * 0.05)
        let hipsY = keyPose(0.0, scale * 0.02, scale * 0.05, scale * 0.03, 0.0)
        let hips = CGPoint(x: hipsBase.x + hipsX, y: hipsBase.y + hipsY)
        
        let lean = keyPose(0.3, 0.2, 0.1, 0.4, 0.35)
        let torsoLen = scale * 0.38
        let shoulders = CGPoint(x: hips.x + sin(lean) * torsoLen, y: hips.y - cos(lean) * torsoLen)
        
        let headRad = scale * 0.14
        
        // Arm logic
        let handleX = keyPose(scale * 0.3, scale * 0.2, -scale * 0.1, scale * 0.5, scale * 0.4)
        let handleY = keyPose(scale * 0.1, scale * 0.2, scale * 0.15, -scale * 0.1, scale * 0.0)
        let handle = CGPoint(x: shoulders.x + handleX, y: shoulders.y + handleY)
        
        let pAngle = stagedPaddleAngle(cycle: c)
        let paddleDir = CGVector(dx: cos(pAngle), dy: sin(pAngle))
        
        let upperArm = scale * 0.25
        let forearm = scale * 0.22
        
        let hitElbow = solveJoint(start: shoulders, end: handle, len1: upperArm, len2: forearm, bendSign: 1.0)
        
        let leftHandX = keyPose(-scale * 0.2, -scale * 0.1, -scale * 0.3, -scale * 0.4, -scale * 0.25)
        let leftHandY = keyPose(scale * 0.1, scale * 0.0, scale * 0.1, scale * 0.2, scale * 0.15)
        let leftHand = CGPoint(x: shoulders.x + leftHandX, y: shoulders.y + leftHandY)
        let leftElbow = solveJoint(start: shoulders, end: leftHand, len1: upperArm, len2: forearm, bendSign: -1.0)
        
        // Legs (Standing)
        let backFoot = CGPoint(x: hipsBase.x - scale * 0.15, y: groundY)
        let frontFoot = CGPoint(x: hipsBase.x + scale * 0.2, y: groundY)
        let upperLeg = scale * 0.21
        let lowerLeg = scale * 0.21
        let backKnee = solveJoint(start: hips, end: backFoot, len1: upperLeg, len2: lowerLeg, bendSign: -1)
        let frontKnee = solveJoint(start: hips, end: frontFoot, len1: upperLeg, len2: lowerLeg, bendSign: -1)
        
        // Ball logic (Ping Pong physics)
        let contactTime = 0.42
        let ballStart = 0.2
        let ballEnd = 0.8
        let ballRad = scale * 0.04
        var ballP: CGPoint? = nil
        
        if c >= ballStart && c < ballEnd {
            if c < contactTime {
                // Ball coming from opponent, bounces on table once
                let p = phase(c, ballStart, contactTime)
                let startP = CGPoint(x: center.x + scale * 1.2, y: tableTopY - scale * 0.2)
                let bounceP = CGPoint(x: center.x + scale * 0.2, y: tableTopY)
                let endP = handle.translated(dx: paddleDir.dx * scale * 0.1, dy: paddleDir.dy * scale * 0.1)
                
                if p < 0.5 {
                    let sp = p / 0.5
                    let baseP = lerpPoint(startP, bounceP, sp)
                    let arcY = -scale * 0.2 * sin(sp * .pi)
                    ballP = CGPoint(x: baseP.x, y: baseP.y + arcY)
                } else {
                    let sp = (p - 0.5) / 0.5
                    let baseP = lerpPoint(bounceP, endP, sp)
                    let arcY = -scale * 0.15 * sin(sp * .pi)
                    ballP = CGPoint(x: baseP.x, y: baseP.y + arcY)
                }
            } else {
                // Ball hit by player, bounces on opponent's side
                let p = phase(c, contactTime, ballEnd)
                let startP = handle.translated(dx: paddleDir.dx * scale * 0.1, dy: paddleDir.dy * scale * 0.1)
                let bounceP = CGPoint(x: center.x + scale * 0.8, y: tableTopY)
                let endP = CGPoint(x: center.x + scale * 1.5, y: tableTopY - scale * 0.3)
                
                if p < 0.6 {
                    let sp = p / 0.6
                    let baseP = lerpPoint(startP, bounceP, sp)
                    let arcY = -scale * 0.1 * sin(sp * .pi)
                    ballP = CGPoint(x: baseP.x, y: baseP.y + arcY)
                } else {
                    let sp = (p - 0.6) / 0.4
                    let baseP = lerpPoint(bounceP, endP, sp)
                    let arcY = -scale * 0.2 * sin(sp * .pi)
                    ballP = CGPoint(x: baseP.x, y: baseP.y + arcY)
                }
            }
        }
        
        let headPos = CGPoint(
            x: shoulders.x + sin(lean - 0.05) * headRad * 1.4,
            y: shoulders.y - cos(lean - 0.05) * headRad * 1.4
        )
        
        let impactPower = c >= 0.4 && c < 0.5 ? smoothStep(phase(c, 0.4, 0.5)) : 0.0
        
        return PingPongState(
            shoulders: shoulders, hips: hips, headPos: headPos, headRad: headRad,
            handle: handle, pAngle: pAngle, paddleDir: paddleDir,
            leftHand: leftHand, hitElbow: hitElbow, leftElbow: leftElbow,
            backKnee: backKnee, frontKnee: frontKnee, backFoot: backFoot, frontFoot: frontFoot,
            ballP: ballP, ballRad: ballRad, lean: lean, groundY: groundY, impactPower: impactPower
        )
    }
    
    private func drawPingPong(into context: inout GraphicsContext, size: CGSize, time t: Double) {
        let cycle = t.truncatingRemainder(dividingBy: 1.0)
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let scale = min(size.width, size.height) * 0.40
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        let ballColor = Color.orange
        let tableRed = Color(red: 0.8, green: 0.1, blue: 0.1)
        
        let state = getPingPongState(cycle: cycle, scale: scale, center: center)
        
        // --- 1. Table & Net ---
        drawTable(context, center, scale)
        
        // --- 2. Stickman ---
        // Back limbs
        drawLimb(context, state.shoulders, state.leftElbow, state.leftHand, color: stickColor.opacity(0.35), width: 8)
        drawLimb(context, state.hips, state.backKnee, state.backFoot, color: stickColor.opacity(0.2), width: 10)
        
        // Torso
        var torsoPath = Path()
        torsoPath.move(to: state.shoulders)
        torsoPath.addLine(to: state.hips)
        context.stroke(torsoPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 12, lineCap: .round))
        
        // Head (Goat Mode Support - Ping Pong uses cara12.png)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara12_negro" : "cara12"))
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
        
        // Front limbs
        drawLimb(context, state.hips, state.frontKnee, state.frontFoot, color: stickColor, width: 10)
        drawLimb(context, state.shoulders, state.hitElbow, state.handle, color: stickColor, width: 8)
        
        // --- 3. Paddle ---
        drawPaddle(context, handle: state.handle, pAngle: state.pAngle, paddleDir: state.paddleDir, scale: scale, color: tableRed)
        
        // --- 4. Ball ---
        if let ballP = state.ballP {
            context.fill(Path(ellipseIn: CGRect(x: ballP.x - state.ballRad, y: ballP.y - state.ballRad, width: state.ballRad * 2, height: state.ballRad * 2)), with: .color(ballColor))
            
            context.drawLayer { g in
                g.addFilter(.blur(radius: 2))
                g.fill(Path(ellipseIn: CGRect(x: ballP.x - state.ballRad * 1.5, y: ballP.y - state.ballRad * 1.5, width: state.ballRad * 3, height: state.ballRad * 3)), with: .color(ballColor.opacity(0.3)))
            }
        }
        
        // Impact
        if state.impactPower > 0 {
            let p = state.handle.translated(dx: state.paddleDir.dx * scale * 0.1, dy: state.paddleDir.dy * scale * 0.1)
            let flashRad = scale * 0.1 * state.impactPower
            context.drawLayer { g in
                g.addFilter(.blur(radius: 5))
                g.fill(Path(ellipseIn: CGRect(x: p.x - flashRad, y: p.y - flashRad, width: flashRad * 2, height: flashRad * 2)), with: .color(Color(colorMode == .darkStickman ? Color.black : Color.white).opacity(0.5 * (1.0 - Double(state.impactPower)))))
            }
        }
    }
    
    private func drawTable(_ context: GraphicsContext, _ center: CGPoint, _ scale: CGFloat) {
        let tableTopY = center.y + scale * 0.15
        let tableWidth = scale * 2.2
        let tableHeight = scale * 0.05
        let tableColor = Color(red: 0.1, green: 0.3, blue: 0.6) // Modern blue table
        
        // Table Top (Side Perspective)
        var tableBody = Path()
        tableBody.addRect(CGRect(x: center.x - scale * 0.4, y: tableTopY, width: tableWidth, height: tableHeight))
        context.fill(tableBody, with: .color(tableColor))
        
        // Table Legs
        var legs = Path()
        legs.move(to: CGPoint(x: center.x - scale * 0.2, y: tableTopY + tableHeight))
        legs.addLine(to: CGPoint(x: center.x - scale * 0.2, y: tableTopY + scale * 0.5))
        legs.move(to: CGPoint(x: center.x + scale * 1.4, y: tableTopY + tableHeight))
        legs.addLine(to: CGPoint(x: center.x + scale * 1.4, y: tableTopY + scale * 0.5))
        context.stroke(legs, with: .color(tableColor.opacity(0.6)), style: StrokeStyle(lineWidth: 4, lineCap: .round))
        
        // Net
        let netHeight = scale * 0.15
        let netX = center.x + scale * 0.5
        var netPath = Path()
        netPath.move(to: CGPoint(x: netX, y: tableTopY))
        netPath.addLine(to: CGPoint(x: netX, y: tableTopY - netHeight))
        context.stroke(netPath, with: .color((colorMode == .darkStickman ? Color.black : Color.white).opacity(0.8)), style: StrokeStyle(lineWidth: 3))
        
        // White lines on table
        var lines = Path()
        lines.move(to: CGPoint(x: center.x - scale * 0.4, y: tableTopY))
        lines.addLine(to: CGPoint(x: center.x + tableWidth - scale * 0.4, y: tableTopY))
        context.stroke(lines, with: .color((colorMode == .darkStickman ? Color.black : Color.white).opacity(0.3)), style: StrokeStyle(lineWidth: 2))
    }
    
    private func drawPaddle(_ context: GraphicsContext, handle: CGPoint, pAngle: CGFloat, paddleDir: CGVector, scale: CGFloat, color: Color) {
        let paddleHeadRad = scale * 0.12
        let handleLen = scale * 0.1
        
        let headCenter = handle.translated(dx: paddleDir.dx * handleLen, dy: paddleDir.dy * handleLen)
        
        // Handle
        var handlePath = Path()
        handlePath.move(to: handle)
        handlePath.addLine(to: headCenter)
        context.stroke(handlePath, with: .color(Color.brown), style: StrokeStyle(lineWidth: 4, lineCap: .round))
        
        // Paddle Head
        let transform = CGAffineTransform.identity.translatedBy(x: headCenter.x, y: headCenter.y).rotated(by: pAngle)
        context.fill(Path(ellipseIn: CGRect(x: -paddleHeadRad, y: -paddleHeadRad, width: paddleHeadRad * 2, height: paddleHeadRad * 2)).applying(transform), with: .color(color))
        
        // Other side (Black)
        context.stroke(Path(ellipseIn: CGRect(x: -paddleHeadRad, y: -paddleHeadRad, width: paddleHeadRad * 2, height: paddleHeadRad * 2)).applying(transform), with: .color(.black.opacity(0.3)), style: StrokeStyle(lineWidth: 2))
    }
    
    private func stagedPaddleAngle(cycle: Double) -> CGFloat {
        let start: CGFloat = 0.5
        let back: CGFloat = 0.8
        let hit: CGFloat = -1.2
        let follow: CGFloat = -1.8
        
        let prepP = smoothStep(phase(cycle, 0.0, 0.2))
        let backP = smoothStep(phase(cycle, 0.2, 0.35))
        let swingP = smoothStep(phase(cycle, 0.35, 0.5))
        let followP = smoothStep(phase(cycle, 0.5, 0.7))
        let recoverP = smoothStep(phase(cycle, 0.7, 1.0))
        
        if cycle < 0.2 { return lerp(start, back, prepP) }
        if cycle < 0.35 { return lerp(back, back + 0.2, backP) }
        if cycle < 0.5 { return lerp(back + 0.2, hit, swingP) }
        if cycle < 0.7 { return lerp(hit, follow, followP) }
        return lerp(follow, start, recoverP)
    }
    
    // Helper Methods
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

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        PingPongView()
            .frame(width: 350, height: 350)
    }
}

