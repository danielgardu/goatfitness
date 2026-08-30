import SwiftUI
import Foundation

struct GolfView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 2.4
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                self.draw(in: &context, size: size, time: timeline.date.timeIntervalSinceReferenceDate)
            }
        }
    }
    
    private func draw(in context: inout GraphicsContext, size: CGSize, time: Double) {
        let t = time * speed
        let center = CGPoint(x: size.width * 0.5, y: size.height * 0.5)
        let scale = min(size.width, size.height) * 0.42
        
        let rawCycle = t.truncatingRemainder(dividingBy: .pi * 2) / (.pi * 2)
        
        var swingFactor: CGFloat = 0
        if rawCycle < 0.18 {
            swingFactor = rawCycle / 0.18
        } else {
            let resetProgress = (rawCycle - 0.18) / 0.82
            swingFactor = 1.0 - (0.5 - cos(resetProgress * .pi) * 0.5)
        }
        
        let hipShift = (swingFactor - 0.45) * scale * 0.04
        let hips = CGPoint(x: center.x + hipShift, y: center.y + scale * 0.35)
        
        let rotation = -1.4 + swingFactor * 2.8
        let torsoLen = scale * 0.48
        
        let shoulders = CGPoint(
            x: hips.x + sin(rotation) * torsoLen * 0.15,
            y: hips.y - cos(rotation * 0.12) * torsoLen * 0.98
        )
        
        let headRad = scale * 0.17
        let headPos = CGPoint(
            x: shoulders.x + sin(rotation * 0.3) * headRad * 0.3,
            y: shoulders.y - headRad * 1.35
        )
        
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        let clubLen = scale * 0.68
        let clubAngle = -2.2 + swingFactor * 6.9
        
        let finishProgress = max(0, (swingFactor - 0.6) / 0.4)
        let handElevate = swingFactor * scale * 0.28
        let handPullX = swingFactor * scale * 0.18
        let handTighten = finishProgress * scale * 0.15
        
        let handPos = CGPoint(
            x: shoulders.x + sin(min(clubAngle, 2.5)) * scale * 0.4 - handTighten + handPullX,
            y: shoulders.y + cos(min(clubAngle, 2.5)) * scale * 0.3 - handElevate
        )
        
        let clubShaftEnd = CGPoint(
            x: handPos.x + sin(clubAngle) * clubLen,
            y: handPos.y + cos(clubAngle) * clubLen
        )
        
        // --- Drawing Helpers ---
        func drawLeg(isFront: Bool) {
            let color = stickColor
            let width: CGFloat = 11
            
            let legRotationFactor = -0.15 + swingFactor * 0.3
            let footBaseX = center.x + (isFront ? scale * 0.28 : -scale * 0.02)
            let footX = footBaseX + sin(legRotationFactor) * scale * 0.2
            let footY = center.y + scale * 0.82
            let foot = CGPoint(x: footX, y: footY)
            
            var kneeOffset: CGFloat = 0
            if isFront {
                kneeOffset = -0.04 + swingFactor * 0.09
            } else {
                if swingFactor < 0.5 {
                    kneeOffset = -0.05 * (1.0 - swingFactor / 0.5)
                } else {
                    kneeOffset = 0
                }
            }
            
            let kneeX = (hips.x + foot.x) / 2 + kneeOffset * scale
            let kneeY = (hips.y + foot.y) / 2 + scale * 0.04
            let knee = CGPoint(x: kneeX, y: kneeY)
            
            var path = Path()
            path.move(to: hips)
            path.addLine(to: knee)
            path.addLine(to: foot)
            context.stroke(path, with: .color(color), style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
        }
        
        func drawArm(isFront: Bool) {
            let opacity = isFront ? 1.0 : 0.4
            let color = stickColor.opacity(opacity)
            let width: CGFloat = 10
            
            let midX = (shoulders.x + handPos.x) / 2
            let midY = (shoulders.y + handPos.y) / 2
            
            let dx = handPos.x - shoulders.x
            let dy = handPos.y - shoulders.y
            let dist = sqrt(dx*dx + dy*dy)
            
            let bendIntensity = scale * 0.18 * (1.0 - dist / (scale * 1.2))
            let bendSide: CGFloat = isFront ? 1.0 : 0.8
            
            let bendAngle = -0.5 + swingFactor * 2.5
            let backArmLift = isFront ? 0 : -scale * 0.05
            let elbow = CGPoint(
                x: midX + sin(bendAngle) * bendIntensity * bendSide,
                y: midY + cos(bendAngle) * bendIntensity * bendSide + backArmLift
            )
            
            var path = Path()
            path.move(to: shoulders)
            path.addLine(to: elbow)
            path.addLine(to: handPos)
            context.stroke(path, with: .color(color), style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
        }
        
        // --- Render Layers ---
        let sW = scale * 1.2
        context.fill(Path(ellipseIn: CGRect(x: center.x - sW/2 + hipShift * 0.5, y: center.y + scale * 0.84, width: sW, height: 10)), with: .color(.black.opacity(0.12)))
        
        drawLeg(isFront: false)
        drawArm(isFront: false)
        
        var clubShaft = Path()
        clubShaft.move(to: handPos)
        clubShaft.addLine(to: clubShaftEnd)
        context.stroke(clubShaft, with: .color(stickColor), style: StrokeStyle(lineWidth: 5, lineCap: .round))
        
        let cHeadAngle = clubAngle + .pi / 2
        let headSize = scale * 0.11
        var clubHead = Path()
        clubHead.move(to: clubShaftEnd)
        let headFaceEnd = CGPoint(
            x: clubShaftEnd.x + sin(cHeadAngle) * headSize,
            y: clubShaftEnd.y + cos(cHeadAngle) * headSize
        )
        clubHead.addLine(to: headFaceEnd)
        context.stroke(clubHead, with: .color(stickColor), style: StrokeStyle(lineWidth: 10, lineCap: .round, lineJoin: .round))
        
        var torso = Path()
        torso.move(to: shoulders)
        torso.addLine(to: hips)
        context.stroke(torso, with: .color(stickColor), style: StrokeStyle(lineWidth: 13, lineCap: .round))
        
        // Head (Goat Mode Support - Golf uses cara1.png)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara1_negro" : "cara1"))
            let imgSize = headRad * 4.76
            let rect = CGRect(
                x: headPos.x - imgSize/2,
                y: headPos.y - imgSize/2 - (headRad * 0.14),
                width: imgSize,
                height: imgSize
            )
            context.draw(headImage, in: rect)
        } else {
            context.fill(
                Path(ellipseIn: CGRect(x: headPos.x - headRad, y: headPos.y - headRad, width: headRad * 2, height: headRad * 2)),
                with: .color(stickColor)
            )
        }
        
        drawLeg(isFront: true)
        drawArm(isFront: true)
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        GolfView()
            .frame(width: 400, height: 400)
    }
}
