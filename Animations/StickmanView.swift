import SwiftUI
import Foundation

struct StickmanView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 7.5
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                draw(context: &context, size: size, timeline: timeline)
            }
        }
    }
    
    private func draw(context: inout GraphicsContext, size: CGSize, timeline: TimelineViewDefaultContext) {
        // Center the drawing area and apply a dynamic shift to provide headroom
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let scale = min(size.width, size.height) * 0.4
        let t = timeline.date.timeIntervalSinceReferenceDate * speed
        
        // Animation Cycle
        let cycle = t.truncatingRemainder(dividingBy: .pi * 2)
        
        // --- Root: Hips ---
        // Vertical bounce: smooth sync with legs
        let bounce = (1 - cos(CGFloat(cycle * 2))) * 2.0
        let hips = CGPoint(x: center.x, y: center.y + bounce)
        
        // --- Torso & Head (Running Right) ---
        let leanAngle: CGFloat = 0.15 // Lean right
        let torsoLen = scale * 0.55
        let shoulders = CGPoint(
            x: hips.x + sin(leanAngle) * torsoLen,
            y: hips.y - cos(leanAngle) * torsoLen
        )
        
        let headRad = scale * 0.16
        let headPos = CGPoint(
            x: shoulders.x + sin(leanAngle) * headRad * 1.5,
            y: shoulders.y - cos(leanAngle) * headRad * 1.5
        )
        
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        let limbScale = scale * 0.55
        
        // Back Limbs
        drawLimb(context: &context, start: shoulders, cycle: cycle, scale: limbScale, phase: .pi, isArm: true, isFront: false, color: stickColor)
        drawLimb(context: &context, start: hips, cycle: cycle, scale: limbScale, phase: 0, isArm: false, isFront: false, color: stickColor)
        
        // Torso & Head
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara6_negro" : "cara6"))
            let imgSize = headRad * 4.76 // 2.8 * 1.7 (70% larger)
            // Slightly higher (14% of radius) as requested
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
        
        // Front Limbs
        drawLimb(context: &context, start: hips, cycle: cycle, scale: limbScale, phase: .pi, isArm: false, isFront: true, color: stickColor)
        drawLimb(context: &context, start: shoulders, cycle: cycle, scale: limbScale, phase: 0, isArm: true, isFront: true, color: stickColor)
        
        // Shadow
        let sW = scale * 0.8 * (1 - bounce/100)
        let shadowRect = CGRect(x: center.x - sW/2, y: center.y + scale * 0.7, width: sW, height: 10)
        context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(0.3)))
    }
    
    private func drawLimb(context: inout GraphicsContext, start: CGPoint, cycle: Double, scale: CGFloat, phase: Double, isArm: Bool, isFront: Bool, color: Color) {
        let p = cycle + phase
        let limbColor = isFront ? color : color.opacity(0.4)
        let width: CGFloat = isArm ? 10 : 12
        
        if isArm {
            // ARM: Swings forward and back, bent at elbow
            let upperAngle = sin(CGFloat(p)) * 0.8
            let elbowAngle = upperAngle + 1.4 // Constant bend
            
            let elbow = CGPoint(
                x: start.x + sin(upperAngle) * scale * 0.55,
                y: start.y + cos(upperAngle) * scale * 0.55
            )
            let hand = CGPoint(
                x: elbow.x + sin(elbowAngle) * scale * 0.45,
                y: elbow.y + cos(elbowAngle) * scale * 0.45
            )
            
            var path = Path()
            path.move(to: start)
            path.addLine(to: elbow)
            path.addLine(to: hand)
            context.stroke(path, with: .color(limbColor), style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
        } else {
            // LEG: Cycling gait
            let upperAngle = sin(CGFloat(p)) * 0.8
            // Knee bends when leg moves forward through the center, straightens to plant the foot
            let kneeFold = max(cos(CGFloat(p)) * 1.8, 0.1)
            let lowerAngle = upperAngle - kneeFold
            
            let knee = CGPoint(
                x: start.x + sin(upperAngle) * scale * 0.5,
                y: start.y + cos(upperAngle) * scale * 0.5
            )
            let foot = CGPoint(
                x: knee.x + sin(lowerAngle) * scale * 0.5,
                y: knee.y + cos(lowerAngle) * scale * 0.5
            )
            
            var path = Path()
            path.move(to: start)
            path.addLine(to: knee)
            path.addLine(to: foot)
            context.stroke(path, with: .color(limbColor), style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
        }
    }
}

#Preview {
    StickmanView()
        .preferredColorScheme(.dark)
}
