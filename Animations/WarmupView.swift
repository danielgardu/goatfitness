import SwiftUI
import Foundation

struct WarmupView: View {
    @Environment(\.animationColorMode) private var colorMode
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate
                self.drawWarmup(in: &context, size: size, time: t)
            }
        }
    }
    
    private func drawWarmup(in context: inout GraphicsContext, size: CGSize, time t: Double) {
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let scale = min(size.width, size.height) * 0.4
        
        let phrase = t.truncatingRemainder(dividingBy: 4.0)
        let isLeft = phrase < 2.0
        let pulse = abs(sin(CGFloat(t) * .pi))
        
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        let lineWidth: CGFloat = 12
        
        let hips = CGPoint(x: center.x, y: center.y + scale * 0.4)
        
        let leanMax: CGFloat = 0.5
        let leanAngle = (isLeft ? -1.0 : 1.0) * pulse * leanMax
        
        let torsoLen = scale * 0.35
        let shoulders = CGPoint(
            x: hips.x + sin(leanAngle) * torsoLen,
            y: hips.y - cos(leanAngle) * torsoLen
        )
        
        let headRad = scale * 0.16
        let headPos = CGPoint(
            x: shoulders.x + sin(leanAngle) * headRad * 1.5,
            y: shoulders.y - cos(leanAngle) * headRad * 1.5
        )
        
        // --- RENDER BODY ---
        var torsoPath = Path()
        torsoPath.move(to: shoulders)
        torsoPath.addLine(to: hips)
        context.stroke(torsoPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 15, lineCap: .round, lineJoin: .round))
        
        // Head (Goat Mode Support - Warm Up uses cara9frente.png)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara9frente_negro" : "cara9frente"))
            let imgSize = headRad * 5.1788 // 10% larger than previous
            let rect = CGRect(
                x: headPos.x - imgSize * 0.45, // 5% left shift from current (net 5% right shift)
                y: headPos.y - imgSize / 2 - (headRad * 0.26) - (imgSize * 0.05), // 5% more up
                width: imgSize,
                height: imgSize
            )
            context.draw(headImage, in: rect)
        } else {
            context.fill(Path(ellipseIn: CGRect(x: headPos.x - headRad, y: headPos.y - headRad, width: headRad * 2, height: headRad * 2)), with: .color(stickColor))
        }
        
        // --- LEGS ---
        let groundY = center.y + scale * 0.9
        let stanceWidth = scale * 0.15
        let leftFoot = CGPoint(x: hips.x - stanceWidth, y: groundY)
        let rightFoot = CGPoint(x: hips.x + stanceWidth, y: groundY)
        
        var legsPath = Path()
        legsPath.move(to: hips)
        legsPath.addLine(to: leftFoot)
        legsPath.move(to: hips)
        legsPath.addLine(to: rightFoot)
        context.stroke(legsPath, with: .color(stickColor), style: StrokeStyle(lineWidth: lineWidth, lineCap: .round, lineJoin: .round))
        
        // --- ARMS ---
        var armsPath = Path()
        let w = CGFloat(max(0.0, min(1.0, sin(phrase * .pi / 2.0) * 2.5 + 0.5)))
        
        func lerp(_ a: CGPoint, _ b: CGPoint, _ t: CGFloat) -> CGPoint {
            return CGPoint(x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t)
        }
        
        // LEFT ARM
        let leftElbowL = CGPoint(x: shoulders.x - scale * 0.22, y: (shoulders.y + hips.y)/2)
        let leftHandL = CGPoint(x: hips.x - scale * 0.06, y: hips.y - scale * 0.05)
        let leftElbowR = CGPoint(x: shoulders.x - scale * 0.22, y: shoulders.y - scale * 0.32)
        let leftHandR = CGPoint(x: headPos.x + scale * 0.10, y: headPos.y - scale * 0.22)
        
        let leftElbow = lerp(leftElbowR, leftElbowL, w)
        let leftHand = lerp(leftHandR, leftHandL, w)
        
        armsPath.move(to: shoulders)
        armsPath.addLine(to: leftElbow)
        armsPath.addLine(to: leftHand)
        
        // RIGHT ARM
        let rightElbowL = CGPoint(x: shoulders.x + scale * 0.22, y: shoulders.y - scale * 0.32)
        let rightHandL = CGPoint(x: headPos.x - scale * 0.10, y: headPos.y - scale * 0.22)
        let rightElbowR = CGPoint(x: shoulders.x + scale * 0.22, y: (shoulders.y + hips.y)/2)
        let rightHandR = CGPoint(x: hips.x + scale * 0.06, y: hips.y - scale * 0.05)
        
        let rightElbow = lerp(rightElbowR, rightElbowL, w)
        let rightHand = lerp(rightHandR, rightHandL, w)
        
        armsPath.move(to: shoulders)
        armsPath.addLine(to: rightElbow)
        armsPath.addLine(to: rightHand)
        
        context.stroke(armsPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 10, lineCap: .round, lineJoin: .round))
        
        // --- SHADOW ---
        let sW = stanceWidth * 3.5
        let shadowRect = CGRect(x: center.x - sW/2, y: groundY + scale * 0.05, width: sW, height: 10)
        context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(0.3)))
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        WarmupView()
            .frame(width: 300, height: 300)
    }
}
