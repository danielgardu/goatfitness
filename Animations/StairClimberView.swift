import SwiftUI
import Foundation

struct StairClimberView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 4.2
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate * speed
                self.drawStairClimber(in: &context, size: size, time: t)
            }
        }
    }
    
    private func drawStairClimber(in context: inout GraphicsContext, size: CGSize, time t: Double) {
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let scale = min(size.width, size.height) * 0.4
        
        let cycle = t.truncatingRemainder(dividingBy: .pi * 2)
        
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        let machineColor = Color.gray.opacity(0.4)
        
        // --- Machine: Frame & Rails ---
        var framePath = Path()
        let frameBottom = center.y + scale * 0.75
        framePath.move(to: CGPoint(x: center.x - scale * 0.8, y: frameBottom))
        framePath.addLine(to: CGPoint(x: center.x + scale * 0.6, y: frameBottom))
        framePath.addLine(to: CGPoint(x: center.x + scale * 0.8, y: center.y - scale * 0.2))
        context.stroke(framePath, with: .color(machineColor), style: StrokeStyle(lineWidth: 6, lineCap: .round))

        for i in 0..<3 {
            let stepX = center.x + scale * 0.55 - CGFloat(i) * scale * 0.3
            let stepY = center.y + scale * 0.2 + CGFloat(i) * scale * 0.2
            
            var bgStepPath = Path()
            let bgStepSize = scale * 0.25
            bgStepPath.move(to: CGPoint(x: stepX - bgStepSize, y: stepY))
            bgStepPath.addLine(to: CGPoint(x: stepX, y: stepY))
            bgStepPath.addLine(to: CGPoint(x: stepX, y: stepY - bgStepSize))
            context.stroke(bgStepPath, with: .color(machineColor.opacity(0.08)), style: StrokeStyle(lineWidth: 4, lineCap: .round, lineJoin: .round))
        }

        var railPath = Path()
        let handPos = CGPoint(x: center.x + scale * 0.55, y: center.y - scale * 0.1)
        railPath.move(to: handPos)
        railPath.addLine(to: CGPoint(x: center.x + scale * 0.8, y: center.y + scale * 0.4)) 
        context.stroke(railPath, with: .color(machineColor), style: StrokeStyle(lineWidth: 10, lineCap: .round, lineJoin: .round))
        
        let stairProgress = (CGFloat(t) / (.pi * 1.8)).truncatingRemainder(dividingBy: 1.0)
        let numSteps = 4 
        
        for i in 0..<numSteps {
            let progress = (CGFloat(stairProgress) + Double(i) / Double(numSteps)).truncatingRemainder(dividingBy: 1.0)
            
            let startX = center.x + scale * 0.6
            let startY = center.y + scale * 0.05
            let travelX = scale * 0.95
            let travelY = scale * 0.95
            
            let stepX = startX - (CGFloat(progress) * travelX)
            let stepY = startY + (CGFloat(progress) * travelY)
            
            var stepPath = Path()
            let stepSize = scale * 0.26
            
            stepPath.move(to: CGPoint(x: stepX - stepSize, y: stepY))
            stepPath.addLine(to: CGPoint(x: stepX, y: stepY))
            stepPath.addLine(to: CGPoint(x: stepX, y: stepY - stepSize))
            
            let alpha: CGFloat
            if progress < 0.2 {
                alpha = progress / 0.2
            } else if progress > 0.75 {
                alpha = max(0, (0.95 - progress) / 0.2)
            } else {
                alpha = 1.0
            }
            
            context.stroke(stepPath, with: .color(machineColor.opacity(0.8 * alpha)), style: StrokeStyle(lineWidth: 6, lineCap: .round, lineJoin: .round))
        }
        
        // --- Root: Hips ---
        let bounce = sin(CGFloat(cycle * 2)) * 3.0
        let hips = CGPoint(x: center.x - scale * 0.1, y: center.y + bounce)
        
        // --- Torso & Head ---
        let leanAngle: CGFloat = 0.05
        let torsoLen = scale * 0.6
        let shoulders = CGPoint(
            x: hips.x + sin(leanAngle) * torsoLen,
            y: hips.y - cos(leanAngle) * torsoLen
        )
        
        let headRad = scale * 0.16
        let headPos = CGPoint(
            x: shoulders.x + sin(leanAngle) * headRad * 1.5,
            y: shoulders.y - cos(leanAngle) * headRad * 1.5
        )
        
        let legLen = scale * 0.65
        
        func drawLimb(start: CGPoint, phase: Double, isArm: Bool, isFront: Bool) {
            let p = cycle + phase
            let color = isFront ? stickColor : stickColor.opacity(0.4)
            let width: CGFloat = isArm ? 10 : 12
            
            if isArm {
                let handAnchor = CGPoint(x: center.x + scale * 0.55, y: center.y - scale * 0.1)
                let midX = (start.x + handAnchor.x) / 2
                let midY = (start.y + handAnchor.y) / 2
                let elbow = CGPoint(x: midX + 10, y: midY + 15)
                
                var path = Path()
                path.move(to: start)
                path.addLine(to: elbow)
                path.addLine(to: handAnchor)
                context.stroke(path, with: .color(color), style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
            } else {
                let lift = max(0, sin(CGFloat(p)))
                let push = min(0, sin(CGFloat(p)))
                
                let upperAngle = -0.3 + lift * 1.3 + push * 0.1
                let kneeFold = lift * 1.6 + abs(push) * 0.4
                let lowerAngle = upperAngle - kneeFold
                
                let knee = CGPoint(
                    x: start.x + sin(upperAngle) * legLen * 0.5,
                    y: start.y + cos(upperAngle) * legLen * 0.5
                )
                let foot = CGPoint(
                    x: knee.x + sin(lowerAngle) * legLen * 0.5,
                    y: knee.y + cos(lowerAngle) * legLen * 0.5
                )
                
                var path = Path()
                path.move(to: start)
                path.addLine(to: knee)
                path.addLine(to: foot)
                context.stroke(path, with: .color(color), style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
            }
        }
        
        // Back Limbs
        drawLimb(start: shoulders, phase: .pi, isArm: true, isFront: false)
        drawLimb(start: hips, phase: 0, isArm: false, isFront: false)
        
        // Torso & Head (Goat Mode Support - Stair Climber uses cara12.png)
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
            context.fill(Path(ellipseIn: CGRect(x: headPos.x - headRad, y: headPos.y - headRad, width: headRad * 2, height: headRad * 2)), with: .color(stickColor))
        }

        var torsoPath = Path()
        torsoPath.move(to: shoulders)
        torsoPath.addLine(to: hips)
        context.stroke(torsoPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 13, lineCap: .round))
        
        // Front Limbs
        drawLimb(start: hips, phase: .pi, isArm: false, isFront: true)
        drawLimb(start: shoulders, phase: 0, isArm: true, isFront: true)
        
        // Shadow
        let sW = scale * 0.6
        let shadowRect = CGRect(x: center.x - sW * 0.8, y: center.y + scale * 0.8, width: sW, height: 6)
        context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(0.3)))
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        StairClimberView()
            .frame(width: 300, height: 300)
    }
}
