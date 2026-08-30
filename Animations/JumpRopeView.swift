import SwiftUI
import Foundation

struct JumpRopeView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 6.0
    var isGoatMode: Bool = false
    var torsoThickness: CGFloat = 12
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                self.draw(in: &context, size: size, time: timeline.date.timeIntervalSinceReferenceDate)
            }
        }
    }
    
    private func draw(in context: inout GraphicsContext, size: CGSize, time: Double) {
        let t = time * speed
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let scale = min(size.width, size.height) * 0.4
        
        let cycle = CGFloat(t.truncatingRemainder(dividingBy: .pi * 2))
        
        // --- PHYSICS ---
        let jumpHeight = scale * 0.18
        let bounce = max(0, cos(cycle)) * jumpHeight
        let squat = max(0, -cos(cycle)) * scale * 0.04
        
        let hips = CGPoint(x: center.x, y: center.y + scale * 0.4 - bounce + squat)
        let torsoLen = scale * 0.35
        let shoulders = CGPoint(x: hips.x, y: hips.y - torsoLen)
        
        let headRad = scale * 0.16
        let headPos = CGPoint(x: shoulders.x, y: shoulders.y - headRad * 1.5)
        
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        let lineWidth: CGFloat = 11
        
        // --- RENDER BODY ---
        var torsoPath = Path()
        torsoPath.move(to: shoulders)
        torsoPath.addLine(to: hips)
        context.stroke(torsoPath, with: .color(stickColor), style: StrokeStyle(lineWidth: torsoThickness, lineCap: .round, lineJoin: .round))
        
        // Head (Goat Mode Support - Jump Rope uses cara9frente.png)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara9frente_negro" : "cara9frente"))
            let imgSize = headRad * 5.1788 // 10% larger than previous
            let rect = CGRect(
                x: headPos.x - imgSize * 0.45, // 5% left shift from current (net 5% right shift)
                y: headPos.y - imgSize/2 - (headRad * 0.26) - (imgSize * 0.05), // 5% more up
                width: imgSize,
                height: imgSize
            )
            context.draw(headImage, in: rect)
        } else {
            context.fill(Path(ellipseIn: CGRect(x: headPos.x - headRad, y: headPos.y - headRad, width: headRad * 2, height: headRad * 2)), with: .color(stickColor))
        }
        
        // --- LEGS ---
        let stanceWidth = scale * 0.15
        let groundY = center.y + scale * 0.85
        let footY = groundY - bounce
        
        let leftFoot = CGPoint(x: hips.x - stanceWidth, y: footY)
        let rightFoot = CGPoint(x: hips.x + stanceWidth, y: footY)
        
        var legsPath = Path()
        legsPath.move(to: hips)
        legsPath.addLine(to: leftFoot)
        legsPath.move(to: hips)
        legsPath.addLine(to: rightFoot)
        context.stroke(legsPath, with: .color(stickColor), style: StrokeStyle(lineWidth: lineWidth, lineCap: .round, lineJoin: .round))
        
        // --- ARMS ---
        let elbowWidth = scale * 0.18
        let elbowY = (shoulders.y + hips.y)/2 + scale * 0.05
        
        let leftElbow = CGPoint(x: shoulders.x - elbowWidth, y: elbowY)
        let rightElbow = CGPoint(x: shoulders.x + elbowWidth, y: elbowY)
        
        let wristCircleR = scale * 0.06
        let wristX = CGFloat(sin(cycle)) * wristCircleR
        let wristY = CGFloat(cos(cycle)) * wristCircleR
        
        let leftHand = CGPoint(x: leftElbow.x - scale * 0.08 + wristX, y: leftElbow.y + wristY)
        let rightHand = CGPoint(x: rightElbow.x + scale * 0.08 + wristX, y: rightElbow.y + wristY)
        
        var armsPath = Path()
        armsPath.move(to: shoulders)
        armsPath.addLine(to: leftElbow)
        armsPath.addLine(to: leftHand)
        armsPath.move(to: shoulders)
        armsPath.addLine(to: rightElbow)
        armsPath.addLine(to: rightHand)
        context.stroke(armsPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 9, lineCap: .round, lineJoin: .round))
        
        // --- ROPE ---
        let ropeYAmp = scale * 2.2
        let ropeYControl = (leftHand.y + rightHand.y)/2 + CGFloat(cos(cycle)) * ropeYAmp
        
        var ropePath = Path()
        ropePath.move(to: leftHand)
        ropePath.addQuadCurve(to: rightHand, control: CGPoint(x: hips.x, y: ropeYControl))
        
        let ropeIsBehind = cos(cycle) <= 0
        if ropeIsBehind {
            context.blendMode = .normal
            context.stroke(ropePath, with: .color((colorMode == .darkStickman ? Color.black : Color.white).opacity(0.3)), style: StrokeStyle(lineWidth: 4))
        } else {
            context.stroke(ropePath, with: .color((colorMode == .darkStickman ? Color.black : Color.white).opacity(0.8)), style: StrokeStyle(lineWidth: 6))
        }
        
        // --- SHADOW ---
        let shadowScale = max(0.2, 1.0 - (bounce / jumpHeight))
        let sW = (stanceWidth * 2) * 2.0 * shadowScale
        let shadowRect = CGRect(x: center.x - sW/2, y: groundY + scale * 0.05, width: sW, height: 10 * shadowScale)
        context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(0.3)))
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        JumpRopeView()
            .frame(width: 300, height: 300)
    }
}
