import SwiftUI
import Foundation

struct IndoorCyclingView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 4.0
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate * self.speed
                self.draw(in: &context, size: size, time: t)
            }
        }
    }
    
    private func draw(in context: inout GraphicsContext, size: CGSize, time: Double) {
        let center = CGPoint(x: size.width / 2.0, y: size.height / 2.0)
        let scale = min(size.width, size.height) * 0.35
        
        // --- Static Bike Geometry ---
        let baseY: CGFloat = center.y + (scale * 0.5)
        let baseWidth: CGFloat = scale * 1.1
        let rearX: CGFloat = center.x - (baseWidth * 0.4)
        let frontX: CGFloat = center.x + (baseWidth * 0.4)
        let machineColor: Color = colorMode == .darkStickman ? .black : .white
        let accentColor: Color = Color(red: 0.8, green: 0.1, blue: 0.1)
        
        // Base
        var baseLine = Path()
        baseLine.move(to: CGPoint(x: rearX, y: baseY))
        baseLine.addLine(to: CGPoint(x: frontX, y: baseY))
        context.stroke(baseLine, with: .color(machineColor), style: StrokeStyle(lineWidth: 6, lineCap: .round))
        
        context.fill(Path(ellipseIn: CGRect(x: rearX - 5.0, y: baseY - 5.0, width: 10, height: 10)), with: .color(machineColor))
        context.fill(Path(ellipseIn: CGRect(x: frontX - 5.0, y: baseY - 5.0, width: 10, height: 10)), with: .color(machineColor))
        
        let bbX: CGFloat = center.x - (scale * 0.05)
        let bbY: CGFloat = baseY - (scale * 0.25)
        let bottomBracket = CGPoint(x: bbX, y: bbY)
        
        // Flywheel/Casing
        let casingW = scale * 0.8
        let casingH = scale * 0.6
        var casingPath = Path()
        casingPath.move(to: CGPoint(x: bbX - (casingW * 0.4), y: bbY + (casingH * 0.3)))
        casingPath.addCurve(
            to: CGPoint(x: bbX + (casingW * 0.4), y: bbY + (casingH * 0.3)),
            control1: CGPoint(x: bbX - (casingW * 0.5), y: bbY - (casingH * 0.4)),
            control2: CGPoint(x: bbX + (casingW * 0.5), y: bbY - (casingH * 0.4))
        )
        casingPath.addCurve(
            to: CGPoint(x: bbX - (casingW * 0.4), y: bbY + (casingH * 0.3)),
            control1: CGPoint(x: bbX + (casingW * 0.3), y: bbY + (casingH * 0.6)),
            control2: CGPoint(x: bbX - (casingW * 0.3), y: bbY + (casingH * 0.6))
        )
        context.fill(casingPath, with: .color(accentColor))
        
        // Frame Posts
        let seatPos = CGPoint(x: bbX - (scale * 0.22), y: bbY - (scale * 0.48))
        let handlebarPos = CGPoint(x: bbX + (scale * 0.38), y: bbY - (scale * 0.42))
        
        var seatPost = Path()
        seatPost.move(to: CGPoint(x: bbX - (scale * 0.15), y: bbY + 10))
        seatPost.addLine(to: seatPos)
        context.stroke(seatPost, with: .color(machineColor), style: StrokeStyle(lineWidth: 5, lineCap: .round))
        
        var handlePost = Path()
        handlePost.move(to: CGPoint(x: bbX + (scale * 0.15), y: bbY + 10))
        handlePost.addLine(to: handlebarPos)
        context.stroke(handlePost, with: .color(machineColor), style: StrokeStyle(lineWidth: 5, lineCap: .round))
        
        // Seat (Rotated 5 degrees)
        let seatAngle = CGFloat(5.0 * Double.pi / 180.0)
        let seatX1 = seatPos.x - cos(seatAngle) * 14.0
        let seatY1 = seatPos.y - sin(seatAngle) * 14.0
        let seatX2 = seatPos.x + cos(seatAngle) * 6.0
        let seatY2 = seatPos.y + sin(seatAngle) * 6.0
        var sPath = Path()
        sPath.move(to: CGPoint(x: seatX1, y: seatY1))
        sPath.addLine(to: CGPoint(x: seatX2, y: seatY2))
        context.stroke(sPath, with: .color(machineColor), style: StrokeStyle(lineWidth: 8, lineCap: .round))
        
        // Pedals
        let cycle = time.truncatingRemainder(dividingBy: Double.pi * 2.0)
        let crankLen = scale * 0.18
        let angle1 = CGFloat(cycle)
        let angle2 = angle1 + CGFloat.pi
        let ped1 = CGPoint(x: bbX + cos(angle1) * crankLen, y: bbY + sin(angle1) * crankLen)
        let ped2 = CGPoint(x: bbX + cos(angle2) * crankLen, y: bbY + sin(angle2) * crankLen)
        
        var cPath1 = Path()
        cPath1.move(to: bottomBracket)
        cPath1.addLine(to: ped1)
        context.stroke(cPath1, with: .color(machineColor), style: StrokeStyle(lineWidth: 4.5, lineCap: .round))
        
        var cPath2 = Path()
        cPath2.move(to: bottomBracket)
        cPath2.addLine(to: ped2)
        context.stroke(cPath2, with: .color(machineColor.opacity(0.4)), style: StrokeStyle(lineWidth: 4.5, lineCap: .round))
        
        // Rider
        let stickColor = machineColor
        let hipPos = CGPoint(x: seatPos.x + 3.0, y: seatPos.y - 5.0)
        let torsoLen = scale * 0.5
        let lean = CGFloat(0.45) 
        let shoulderPos = CGPoint(x: hipPos.x + sin(lean) * torsoLen, y: hipPos.y - cos(lean) * torsoLen)
        let headRad = scale * 0.168 // slightly larger head
        let headPos = CGPoint(x: shoulderPos.x + sin(lean) * headRad, y: shoulderPos.y - (headRad * 1.3))
        
        let tLen = scale * 0.45
        let sLen = scale * 0.42
        let knee1 = self.solveKnee(hip: hipPos, foot: ped1, thighLen: tLen, shinLen: sLen, bendForward: true)
        let knee2 = self.solveKnee(hip: hipPos, foot: ped2, thighLen: tLen, shinLen: sLen, bendForward: true)
        
        // Limbs function
        func drawLimb(p1: CGPoint, p2: CGPoint, p3: CGPoint, color: Color, width: CGFloat) {
            var path = Path()
            path.move(to: p1)
            path.addLine(to: p2)
            path.addLine(to: p3)
            context.stroke(path, with: .color(color), style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
        }
        
        // Legs
        drawLimb(p1: hipPos, p2: knee2, p3: ped2, color: stickColor.opacity(0.35), width: 11)
        drawLimb(p1: hipPos, p2: knee1, p3: ped1, color: stickColor, width: 11)
        
        // Arms
        let backHand = CGPoint(x: handlebarPos.x - 2, y: handlebarPos.y - 3)
        let backElbow = CGPoint(x: (shoulderPos.x + backHand.x) / 2.0 - 3.0, y: (shoulderPos.y + backHand.y) / 2.0 + 8.0)
        drawLimb(p1: shoulderPos, p2: backElbow, p3: backHand, color: stickColor.opacity(0.35), width: 9)
        
        let frontHand = CGPoint(x: handlebarPos.x + 2, y: handlebarPos.y - 3)
        let frontElbow = CGPoint(x: (shoulderPos.x + frontHand.x) / 2.0 + 3.0, y: (shoulderPos.y + frontHand.y) / 2.0 + 8.0)
        drawLimb(p1: shoulderPos, p2: frontElbow, p3: frontHand, color: stickColor, width: 9)
        
        // Body (Goat Mode Support)
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
            context.fill(Path(ellipseIn: CGRect(x: headPos.x - headRad, y: headPos.y - headRad, width: headRad * 2.0, height: headRad * 2.0)), with: .color(stickColor))
        }
        
        var torso = Path()
        torso.move(to: shoulderPos)
        torso.addLine(to: hipPos)
        context.stroke(torso, with: .color(stickColor), style: StrokeStyle(lineWidth: 13, lineCap: .round))
        
        // Handlebar
        var hBar = Path()
        hBar.move(to: CGPoint(x: handlebarPos.x - 8, y: handlebarPos.y - 8))
        hBar.addLine(to: handlebarPos)
        hBar.addLine(to: CGPoint(x: handlebarPos.x + 5, y: handlebarPos.y - 12))
        context.stroke(hBar, with: .color(machineColor), style: StrokeStyle(lineWidth: 4, lineCap: .round, lineJoin: .round))
        
        let shadowRect = CGRect(x: center.x - (scale * 0.75), y: baseY + 5.0, width: scale * 1.5, height: 7.0)
        context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(0.15)))
    }

    private func solveKnee(hip: CGPoint, foot: CGPoint, thighLen: CGFloat, shinLen: CGFloat, bendForward: Bool) -> CGPoint {
        let dx: CGFloat = foot.x - hip.x
        let dy: CGFloat = foot.y - hip.y
        let d2: CGFloat = dx*dx + dy*dy
        var dist: CGFloat = sqrt(d2)
        
        let maxDist: CGFloat = thighLen + shinLen - 1.0
        let minDist: CGFloat = abs(thighLen - shinLen) + 1.0
        dist = max(minDist, min(dist, maxDist))
        
        let baseAngle: CGFloat = atan2(dx, dy)
        let cosA: CGFloat = (thighLen * thighLen + dist * dist - shinLen * shinLen) / (2.0 * thighLen * dist)
        let a: CGFloat = acos(max(-1.0, min(1.0, cosA)))
        
        let kneeAngle: CGFloat = bendForward ? baseAngle + a : baseAngle - a
        
        return CGPoint(
            x: hip.x + sin(kneeAngle) * thighLen,
            y: hip.y + cos(kneeAngle) * thighLen
        )
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        IndoorCyclingView()
            .frame(width: 300, height: 300)
    }
}
