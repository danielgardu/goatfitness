import SwiftUI
import Foundation

struct SoccerView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 7.5
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate * speed
                self.drawSoccer(in: &context, size: size, time: t)
            }
        }
    }
    
    private func drawSoccer(in context: inout GraphicsContext, size: CGSize, time t: Double) {
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let scale = min(size.width, size.height) * 0.4
        
        let cycle = t.truncatingRemainder(dividingBy: .pi * 2)
        
        // --- Root: Hips ---
        let bounce = (1 - cos(CGFloat(cycle * 2))) * 2.0
        let hips = CGPoint(x: center.x, y: center.y + bounce)
        
        // --- Torso & Head ---
        let leanAngle: CGFloat = 0.15 
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
        let armLen = scale * 0.55
        let legLen = scale * 0.55
        
        func drawLimb(start: CGPoint, phase: Double, isArm: Bool, isFront: Bool) {
            let p = cycle + phase
            let color = isFront ? stickColor : stickColor.opacity(0.4)
            let width: CGFloat = isArm ? 10 : 12
            
            if isArm {
                let upperAngle = sin(CGFloat(p)) * 0.8
                let elbowAngle = upperAngle + 1.4
                
                let elbow = CGPoint(
                    x: start.x + sin(upperAngle) * armLen * 0.55,
                    y: start.y + cos(upperAngle) * armLen * 0.55
                )
                let hand = CGPoint(
                    x: elbow.x + sin(elbowAngle) * armLen * 0.45,
                    y: elbow.y + cos(elbowAngle) * armLen * 0.45
                )
                
                var path = Path()
                path.move(to: start)
                path.addLine(to: elbow)
                path.addLine(to: hand)
                context.stroke(path, with: .color(color), style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
            } else {
                let upperAngle = sin(CGFloat(p)) * 0.8
                let kneeFold = max(cos(CGFloat(p)) * 1.8, 0.1)
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
        
        // Head (Goat Mode Support - Soccer uses cara6.png)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara13_negro" : "cara13"))
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
        
        // Soccer Ball
        let ballRad = scale * 0.12
        let ballXOffset = -cos(CGFloat(cycle * 2)) * scale * 0.18
        let ballYOffset = -abs(sin(CGFloat(cycle * 2))) * scale * 0.05
        let ballPos = CGPoint(
            x: center.x + scale * 0.45 + ballXOffset,
            y: center.y + scale * 0.58 + ballYOffset
        )
        
        context.fill(Path(ellipseIn: CGRect(x: ballPos.x - ballRad, y: ballPos.y - ballRad, width: ballRad * 2, height: ballRad * 2)), with: .color(stickColor))
        
        // Shadow
        let sW = scale * 0.8 * (1 - bounce/100)
        let shadowRect = CGRect(x: center.x - sW/2, y: center.y + scale * 0.7, width: sW, height: 10)
        context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(0.3)))
        
        // Ball Shadow
        let ballSW = ballRad * 1.5 * (1 - abs(sin(CGFloat(cycle * 2))) * 0.5)
        let ballShadowRect = CGRect(x: ballPos.x - ballSW/2, y: center.y + scale * 0.7 + 2.0, width: ballSW, height: 4.0)
        context.fill(Path(ellipseIn: ballShadowRect), with: .color(.black.opacity(0.3)))
    }
}

#Preview {
    SoccerView()
        .preferredColorScheme(.dark)
}
