import SwiftUI
import Foundation

struct CyclistView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 4.0
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                draw(context: &context, size: size, timeline: timeline)
            }
        }
    }
    
    private func draw(context: inout GraphicsContext, size: CGSize, timeline: TimelineViewDefaultContext) {
        let t = timeline.date.timeIntervalSinceReferenceDate * speed
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let scale = min(size.width, size.height) * 0.35
        
        let cycle = t.truncatingRemainder(dividingBy: .pi * 2)
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        
        // --- Bicycle geometry ---
        let wheelRadius: CGFloat = scale * 0.3
        let wheelY: CGFloat = center.y + scale * 0.5
        let rearWheelX: CGFloat = center.x - scale * 0.48
        let frontWheelX: CGFloat = center.x + scale * 0.48
        let rearWheelCenter = CGPoint(x: rearWheelX, y: wheelY)
        let frontWheelCenter = CGPoint(x: frontWheelX, y: wheelY)
        
        let wheelRotation = CGFloat(cycle)
        
        // Draw wheels
        func drawWheel(at wCenter: CGPoint) {
            context.stroke(
                Path(ellipseIn: CGRect(
                    x: wCenter.x - wheelRadius, y: wCenter.y - wheelRadius,
                    width: wheelRadius * 2, height: wheelRadius * 2
                )),
                with: .color(stickColor),
                style: StrokeStyle(lineWidth: 3.5, lineCap: .round)
            )
            context.fill(
                Path(ellipseIn: CGRect(x: wCenter.x - 3, y: wCenter.y - 3, width: 6, height: 6)),
                with: .color(stickColor)
            )
            for i in 0..<4 {
                let angle = wheelRotation + CGFloat(i) * .pi / 2
                var spoke = Path()
                spoke.move(to: wCenter)
                spoke.addLine(to: CGPoint(
                    x: wCenter.x + cos(angle) * (wheelRadius - 4),
                    y: wCenter.y + sin(angle) * (wheelRadius - 4)
                ))
                context.stroke(spoke, with: .color(stickColor.opacity(0.2)),
                    style: StrokeStyle(lineWidth: 1.5))
            }
        }
        
        drawWheel(at: rearWheelCenter)
        drawWheel(at: frontWheelCenter)
        
        // --- Frame ---
        let bbX = rearWheelX + (frontWheelX - rearWheelX) * 0.42
        let bbY = wheelY - wheelRadius * 0.25
        let bottomBracket = CGPoint(x: bbX, y: bbY)
        
        let seatPos = CGPoint(x: rearWheelX + scale * 0.18, y: wheelY - wheelRadius * 1.55)
        let handlebarPos = CGPoint(x: frontWheelX - scale * 0.08, y: wheelY - wheelRadius * 1.35)
        
        func drawFrame() {
            let frameColor = stickColor
            let frameW: CGFloat = 3.5
            
            var seatTube = Path()
            seatTube.move(to: bottomBracket)
            seatTube.addLine(to: seatPos)
            context.stroke(seatTube, with: .color(frameColor),
                style: StrokeStyle(lineWidth: frameW, lineCap: .round))
            
            var downTube = Path()
            downTube.move(to: bottomBracket)
            downTube.addLine(to: handlebarPos)
            context.stroke(downTube, with: .color(frameColor),
                style: StrokeStyle(lineWidth: frameW, lineCap: .round))
            
            var topTube = Path()
            topTube.move(to: seatPos)
            topTube.addLine(to: handlebarPos)
            context.stroke(topTube, with: .color(frameColor),
                style: StrokeStyle(lineWidth: 2.5, lineCap: .round))
            
            var rearStay = Path()
            rearStay.move(to: rearWheelCenter)
            rearStay.addLine(to: bottomBracket)
            context.stroke(rearStay, with: .color(frameColor),
                style: StrokeStyle(lineWidth: 2.5, lineCap: .round))
            
            var seatStay = Path()
            seatStay.move(to: rearWheelCenter)
            seatStay.addLine(to: seatPos)
            context.stroke(seatStay, with: .color(frameColor),
                style: StrokeStyle(lineWidth: 2, lineCap: .round))
            
            var fork = Path()
            fork.move(to: frontWheelCenter)
            fork.addLine(to: handlebarPos)
            context.stroke(fork, with: .color(frameColor),
                style: StrokeStyle(lineWidth: 2.5, lineCap: .round))
        }
        drawFrame()
        
        // --- Pedal crank ---
        let crankLen: CGFloat = scale * 0.18
        let pedalAngle1 = CGFloat(cycle)
        let pedalAngle2 = pedalAngle1 + .pi
        
        let pedal1 = CGPoint(
            x: bottomBracket.x + cos(pedalAngle1) * crankLen,
            y: bottomBracket.y + sin(pedalAngle1) * crankLen
        )
        let pedal2 = CGPoint(
            x: bottomBracket.x + cos(pedalAngle2) * crankLen,
            y: bottomBracket.y + sin(pedalAngle2) * crankLen
        )
        
        var crank1Path = Path()
        crank1Path.move(to: bottomBracket)
        crank1Path.addLine(to: pedal1)
        context.stroke(crank1Path, with: .color(stickColor),
            style: StrokeStyle(lineWidth: 3.5, lineCap: .round))
        
        var crank2Path = Path()
        crank2Path.move(to: bottomBracket)
        crank2Path.addLine(to: pedal2)
        context.stroke(crank2Path, with: .color(stickColor.opacity(0.4)),
            style: StrokeStyle(lineWidth: 3.5, lineCap: .round))
        
        // --- Rider ---
        let hipPos = CGPoint(x: seatPos.x + 3, y: seatPos.y - 5)
        
        let torsoLen: CGFloat = scale * 0.5
        let leanAngle: CGFloat = 0.4
        let shoulderPos = CGPoint(
            x: hipPos.x + sin(leanAngle) * torsoLen,
            y: hipPos.y - cos(leanAngle) * torsoLen
        )
        
        let headRad: CGFloat = scale * 0.14 * 1.2 // slightly larger head
        let headPos = CGPoint(
            x: shoulderPos.x + sin(leanAngle) * headRad,
            y: shoulderPos.y - headRad * 1.3
        )
        
        // --- 2-bone IK for legs ---
        let thighLen: CGFloat = scale * 0.45
        let shinLen: CGFloat = scale * 0.42
        
        func solveKnee(hip: CGPoint, foot: CGPoint, bendForward: Bool) -> CGPoint {
            let dx = foot.x - hip.x
            let dy = foot.y - hip.y
            var dist = sqrt(dx * dx + dy * dy)
            
            // Clamp distance to valid range
            let maxDist = thighLen + shinLen - 1
            let minDist = abs(thighLen - shinLen) + 1
            dist = max(minDist, min(dist, maxDist))
            
            let baseAngle = atan2(dx, dy)
            
            // Law of cosines for knee angle
            let cosA = (thighLen * thighLen + dist * dist - shinLen * shinLen) / (2 * thighLen * dist)
            let a = acos(max(-1, min(1, cosA)))
            
            let kneeAngle = bendForward ? baseAngle + a : baseAngle - a
            
            return CGPoint(
                x: hip.x + sin(kneeAngle) * thighLen,
                y: hip.y + cos(kneeAngle) * thighLen
            )
        }
        
        let knee1 = solveKnee(hip: hipPos, foot: pedal1, bendForward: true)
        let knee2 = solveKnee(hip: hipPos, foot: pedal2, bendForward: true)
        
        // pedal1 is always drawn as front, pedal2 as back.
        // Since they are π apart and continuously rotate, this is seamless.
        let legW: CGFloat = 11
        
        var backLeg = Path()
        backLeg.move(to: hipPos)
        backLeg.addLine(to: knee2)
        backLeg.addLine(to: pedal2)
        context.stroke(backLeg, with: .color(stickColor.opacity(0.35)),
            style: StrokeStyle(lineWidth: legW, lineCap: .round, lineJoin: .round))
        
        // Back arm
        let backHand = CGPoint(x: handlebarPos.x - 2, y: handlebarPos.y - 3)
        let backElbow = CGPoint(
            x: (shoulderPos.x + backHand.x) / 2 - 3,
            y: (shoulderPos.y + backHand.y) / 2 + 8
        )
        var backArm = Path()
        backArm.move(to: shoulderPos)
        backArm.addLine(to: backElbow)
        backArm.addLine(to: backHand)
        context.stroke(backArm, with: .color(stickColor.opacity(0.35)),
            style: StrokeStyle(lineWidth: 9, lineCap: .round, lineJoin: .round))
        
        // --- Head (Goat Mode Support) ---
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara12_negro" : "cara12"))
            let imgSize = headRad * 4.76 // Consistent consistent factor
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
        frontLeg.addLine(to: knee1)
        frontLeg.addLine(to: pedal1)
        context.stroke(frontLeg, with: .color(stickColor),
            style: StrokeStyle(lineWidth: legW, lineCap: .round, lineJoin: .round))
        
        // Front arm
        let frontHand = CGPoint(x: handlebarPos.x + 2, y: handlebarPos.y - 3)
        let frontElbow = CGPoint(
            x: (shoulderPos.x + frontHand.x) / 2 + 3,
            y: (shoulderPos.y + frontHand.y) / 2 + 8
        )
        var frontArm = Path()
        frontArm.move(to: shoulderPos)
        frontArm.addLine(to: frontElbow)
        frontArm.addLine(to: frontHand)
        context.stroke(frontArm, with: .color(stickColor),
            style: StrokeStyle(lineWidth: 9, lineCap: .round, lineJoin: .round))
        
        // Handlebar crossbar
        var handlebar = Path()
        handlebar.move(to: CGPoint(x: handlebarPos.x - 6, y: handlebarPos.y - 5))
        handlebar.addLine(to: CGPoint(x: handlebarPos.x + 8, y: handlebarPos.y - 5))
        context.stroke(handlebar, with: .color(stickColor),
            style: StrokeStyle(lineWidth: 3.5, lineCap: .round))
        
        // Shadow
        let sW = scale * 1.8
        let shadowRect = CGRect(x: center.x - sW / 2, y: wheelY + wheelRadius + 5, width: sW, height: 7)
        context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(0.15)))
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        CyclistView()
            .frame(width: 300, height: 300)
    }
}
