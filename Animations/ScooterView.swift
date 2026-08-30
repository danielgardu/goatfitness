import SwiftUI
import Foundation

struct ScooterView: View {
    @Environment(\.animationColorMode) private var colorMode
    // Ernest Stigman on a Scooter - Professional Procedural Animation
    let speed: Double = 1.0 // Normalized speed multiplier
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate * speed
                self.drawScooter(in: &context, size: size, time: t)
            }
        }
        .preferredColorScheme(.dark)
    }
    
    private func drawScooter(in context: inout GraphicsContext, size: CGSize, time t: Double) {
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let scale = min(size.width, size.height) * 0.45
        
        // Color Palette
        let charColor: Color = colorMode == .darkStickman ? .black : .white
        let accentColor = Color(hue: 0.55, saturation: 0.8, brightness: 1.0) // Electric Blue
        let scooterColor: Color = colorMode == .darkStickman ? .black : Color(white: 0.9)
        let groundColor = Color(colorMode == .darkStickman ? Color.black : Color.white).opacity(0.15)
        
        // --- World & Physics ---
        let groundY = center.y + scale * 0.75
        let wheelRadius = scale * 0.12
        let deckWidth = scale * 0.9
        let deckHeight = scale * 0.05
        let deckY = groundY - wheelRadius - deckHeight / 2
        
        // Horizontal motion simulation
        let translation = t * 350.0 
        let wheelRotation = CGFloat(translation / wheelRadius)
        
        // --- Animation Timing ---
        let cycleDuration: Double = 1.6
        let cycleT = (t / cycleDuration).truncatingRemainder(dividingBy: 1.0)
        
        // Custom easing for push phase
        func easeInOutQuad(_ x: CGFloat) -> CGFloat {
            return x < 0.5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2
        }
        
        var pushFoot = CGPoint.zero
        var pushForce: CGFloat = 0 // Used for lean and bounce
        
        if cycleT < 0.3 {
            // Recovery
            let p = CGFloat(cycleT / 0.3)
            let startX = center.x - scale * 0.2
            let endX = center.x + scale * 0.4
            pushFoot = CGPoint(
                x: startX + (endX - startX) * p,
                y: groundY - 25 * sin(p * .pi) - 10
            )
        } else if cycleT < 0.4 {
            // Plant
            let p = CGFloat((cycleT - 0.3) / 0.1)
            pushFoot = CGPoint(
                x: center.x + scale * 0.4,
                y: (groundY - 10) + (10) * p
            )
        } else if cycleT < 0.8 {
            // PUSH!
            let p = CGFloat((cycleT - 0.4) / 0.4)
            let startX = center.x + scale * 0.4
            let endX = center.x - scale * 0.4
            pushFoot = CGPoint(x: startX + (endX - startX) * p, y: groundY)
            pushForce = sin(p * .pi) // Peak force in middle of push
        } else {
            // Lift
            let p = CGFloat((cycleT - 0.8) / 0.2)
            pushFoot = CGPoint(
                x: center.x - scale * 0.4 - 20 * p,
                y: groundY - 20 * p
            )
        }
        
        // --- Layout ---
        let bounce = pushForce * 8.0
        // Raised hips significantly to change from kneeling to standing
        let hips = CGPoint(x: center.x - scale * 0.2, y: deckY - scale * 0.48 + bounce)
        
        let torsoLean = 0.12 + pushForce * 0.1
        let torsoLen = scale * 0.48
        let shoulders = CGPoint(
            x: hips.x + sin(torsoLean) * torsoLen,
            y: hips.y - cos(torsoLean) * torsoLen
        )
        
        let headBob = sin(CGFloat(t * 8)) * 2
        let headRad = scale * 0.15
        let headPos = CGPoint(
            x: shoulders.x + sin(torsoLean) * headRad * 1.5,
            y: shoulders.y - cos(torsoLean) * headRad * 1.5 + headBob
        )
        
        let footOnDeck = CGPoint(x: center.x - scale * 0.1, y: deckY)
        
        // Scooter Components
        let backWheelCenter = CGPoint(x: center.x - deckWidth * 0.45, y: groundY - wheelRadius)
        let frontWheelCenter = CGPoint(x: center.x + deckWidth * 0.45, y: groundY - wheelRadius)
        let steerBase = CGPoint(x: frontWheelCenter.x, y: deckY)
        let handlebarAngle: CGFloat = -0.1
        let handleLen = scale * 0.85
        let handlePos = CGPoint(
            x: steerBase.x + sin(handlebarAngle) * handleLen,
            y: steerBase.y - cos(handlebarAngle) * handleLen
        )
        
        // --- DRAWING ---
        
        // 1. Motion Lines (Background)
        for i in 0..<5 {
            let lineX = (CGFloat(translation * 1.2) + CGFloat(i) * size.width * 0.3).truncatingRemainder(dividingBy: size.width + 100) - 50
            let lineY = groundY + 15 + CGFloat(i * 4)
            var linePath = Path()
            linePath.move(to: CGPoint(x: lineX, y: lineY))
            linePath.addLine(to: CGPoint(x: lineX + 60, y: lineY))
            context.stroke(linePath, with: .color(groundColor), style: StrokeStyle(lineWidth: 2, lineCap: .round))
        }
        
        // 2. Wheels
        func drawScooterWheel(in ctx: GraphicsContext, at wCenter: CGPoint) {
            let wRect = CGRect(x: wCenter.x - wheelRadius, y: wCenter.y - wheelRadius, width: wheelRadius * 2, height: wheelRadius * 2)
            
            // Tire
            ctx.stroke(Path(ellipseIn: wRect), with: .color(scooterColor), style: StrokeStyle(lineWidth: scale * 0.04))
            
            // Spokes
            for i in 0..<3 {
                let angle = wheelRotation + CGFloat(i) * (.pi * 2 / 3)
                var spoke = Path()
                spoke.move(to: wCenter)
                spoke.addLine(to: CGPoint(
                    x: wCenter.x + cos(angle) * (wheelRadius - 6),
                    y: wCenter.y + sin(angle) * (wheelRadius - 6)
                ))
                ctx.stroke(spoke, with: .color(scooterColor.opacity(0.4)), style: StrokeStyle(lineWidth: 3))
            }
            
            // Hub
            ctx.fill(Path(ellipseIn: CGRect(x: wCenter.x - 5, y: wCenter.y - 5, width: 10, height: 10)), with: .color(accentColor))
        }
        
        drawScooterWheel(in: context, at: backWheelCenter)
        drawScooterWheel(in: context, at: frontWheelCenter)
        
        // 3. Deck
        let deckPath = Path(roundedRect: CGRect(x: center.x - deckWidth * 0.5, y: deckY, width: deckWidth, height: deckHeight), cornerRadius: 6)
        context.fill(deckPath, with: .linearGradient(Gradient(colors: [scooterColor, scooterColor.opacity(0.7)]), startPoint: CGPoint(x: 0, y: deckY), endPoint: CGPoint(x: 0, y: deckY + deckHeight)))
        
        // 4. Handlebars / Steer tube
        var steerPath = Path()
        steerPath.move(to: steerBase)
        steerPath.addLine(to: handlePos)
        context.stroke(steerPath, with: .color(scooterColor), style: StrokeStyle(lineWidth: 8, lineCap: .round))
        
        var topBar = Path()
        topBar.move(to: CGPoint(x: handlePos.x - 20, y: handlePos.y))
        topBar.addLine(to: CGPoint(x: handlePos.x + 20, y: handlePos.y))
        context.stroke(topBar, with: .color(accentColor), style: StrokeStyle(lineWidth: 7, lineCap: .round))
        
        // 5. Character: ERNEST STIGMAN
        func drawBone(in ctx: GraphicsContext, from: CGPoint, to: CGPoint, width: CGFloat, isFront: Bool) {
            let color = isFront ? charColor : charColor.opacity(0.4)
            
            // Subtle IK bend - adjusted to ensure both knees point forward (right)
            let midX = (from.x + to.x) / 2
            let midY = (from.y + to.y) / 2
            let bendDir: CGFloat = 1.0 // Both legs now bend forward/right
            let dist = sqrt(pow(to.x - from.x, 2) + pow(to.y - from.y, 2))
            let bendAmount = max(0, (scale * 0.8 - dist) * 0.4)
            
            let mid = CGPoint(x: midX + bendDir * bendAmount, y: midY + bendAmount * 0.5)
            
            var p = Path()
            p.move(to: from)
            p.addLine(to: mid)
            p.addLine(to: to)
            ctx.stroke(p, with: .color(color), style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
        }
        
        // Back Leg
        drawBone(in: context, from: hips, to: pushFoot, width: 14, isFront: false)
        
        // Torso
        var torsoPath = Path()
        torsoPath.move(to: shoulders)
        torsoPath.addLine(to: hips)
        context.stroke(torsoPath, with: .color(charColor), style: StrokeStyle(lineWidth: 18, lineCap: .round))
        
        // Head (Goat Mode Support - Scooter uses cara12.png)
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
            context.fill(Path(ellipseIn: CGRect(x: headPos.x - headRad, y: headPos.y - headRad, width: headRad * 2, height: headRad * 2)), with: .color(charColor))
            context.stroke(Path(ellipseIn: CGRect(x: headPos.x - headRad, y: headPos.y - headRad, width: headRad * 2, height: headRad * 2)), with: .color(.black.opacity(0.1)), style: StrokeStyle(lineWidth: 2))
        }
        
        // Front Leg
        drawBone(in: context, from: hips, to: footOnDeck, width: 14, isFront: true)
        
        // Arms
        let armTarget = CGPoint(x: handlePos.x, y: handlePos.y + 2)
        drawBone(in: context, from: shoulders, to: armTarget, width: 11, isFront: true)
        
        // 6. Shadow
        let sW = scale * 1.5 - bounce * 2
        let shadowRect = CGRect(x: center.x - sW/2, y: groundY + 12, width: sW, height: 10)
        context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(0.2)))
    }
}

#Preview {
    ZStack {
        Color(white: 0.05).ignoresSafeArea()
        ScooterView()
            .frame(width: 400, height: 400)
    }
}
