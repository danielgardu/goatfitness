import SwiftUI
import Foundation

struct SwimmingView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 3.5
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate * speed
                self.drawSwimming(in: &context, size: size, time: t)
            }
        }
    }
    
    private func drawSwimming(in context: inout GraphicsContext, size: CGSize, time t: Double) {
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let scale = min(size.width, size.height) * 0.4
        
        let cycle = (t).truncatingRemainder(dividingBy: .pi * 2)
        
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        
        // --- Organic Body Kinematics ---
        let shoulderBob = sin(cycle * 2) * scale * 0.05
        let shoulderXBob = cos(cycle * 2) * scale * 0.03
        
        let shoulder = CGPoint(x: center.x + scale * 0.15 + shoulderXBob, y: center.y + scale * 0.05 + shoulderBob)
        
        // Hips are static, acting as the pivot in the water
        let hips = CGPoint(x: center.x - scale * 0.4, y: center.y + scale * 0.25)
        
        // Head with a slight breathing lift
        let headRad = scale * 0.15
        let headLift = max(0, sin(cycle * 2 - .pi/2) * scale * 0.03)
        let headPos = CGPoint(x: shoulder.x + scale * 0.22, y: shoulder.y - scale * 0.2 - headLift)
        
        // --- Water Mask (clip path for the stickman) ---
        var waterMask = Path()
        let wave1Offset = t * 3.0
        let waveLength1: CGFloat = scale * 1.4
        let amp1: CGFloat = scale * 0.08
        let waterLevel1 = center.y + scale * 0.2
        
        waterMask.move(to: CGPoint(x: 0, y: 0))
        for x in stride(from: 0.0, through: Double(size.width) + 5.0, by: 5.0) {
            let drawX = min(CGFloat(x), size.width)
            let y = waterLevel1 + sin(drawX / waveLength1 + wave1Offset) * amp1
            waterMask.addLine(to: CGPoint(x: drawX, y: y))
        }
        waterMask.addLine(to: CGPoint(x: size.width, y: 0))
        waterMask.closeSubpath()
        
        // --- Arm Drawing Function ---
        func drawArm(ctx: GraphicsContext, phaseOffset: Double, isFront: Bool) {
            let rawP = (cycle + phaseOffset).truncatingRemainder(dividingBy: .pi * 2)
            let p = CGFloat(rawP)
            
            // Shoulder angle rotates 360 smoothly
            let shoulderAngle = p
            
            let isRecovery = p > .pi
            let bendAmt: CGFloat
            if isRecovery {
                bendAmt = sin(p - .pi) * 2.2 
            } else {
                bendAmt = sin(p) * 0.4
            }
            
            let elbowAngle = shoulderAngle + bendAmt
            
            let color = isFront ? stickColor : stickColor.opacity(0.3)
            let width: CGFloat = isFront ? 11 : 9
            
            let armLen1 = scale * 0.35
            let armLen2 = scale * 0.35
            
            let elbow = CGPoint(
                x: shoulder.x + cos(shoulderAngle) * armLen1,
                y: shoulder.y + sin(shoulderAngle) * armLen1
            )
            let hand = CGPoint(
                x: elbow.x + cos(elbowAngle) * armLen2,
                y: elbow.y + sin(elbowAngle) * armLen2
            )
            
            var path = Path()
            path.move(to: shoulder)
            path.addLine(to: elbow)
            path.addLine(to: hand)
            
            ctx.stroke(path, with: .color(color), style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
        }
        
        // --- Drawing Order ---
        
        // Draw stickman clipped to the water surface
        context.drawLayer { ctx in
            ctx.clip(to: waterMask)
            
            // 1. Back Arm
            drawArm(ctx: ctx, phaseOffset: .pi, isFront: false)
            
            // 2. Torso
            var torsoPath = Path()
            torsoPath.move(to: shoulder)
            torsoPath.addLine(to: hips)
            ctx.stroke(torsoPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 13, lineCap: .round))
            
            // 3. Head (Goat Mode Support - Swimming uses cara12.png)
            if isGoatMode {
                let headImage = ctx.resolve(Image(colorMode == .darkStickman ? "cara12_negro" : "cara12"))
                let imgSize = headRad * 4.76
                let rect = CGRect(
                    x: headPos.x - imgSize/2,
                    y: headPos.y - imgSize/2 - (headRad * 0.14),
                    width: imgSize,
                    height: imgSize
                )
                ctx.draw(headImage, in: rect)
            } else {
                ctx.fill(Path(ellipseIn: CGRect(x: headPos.x - headRad, y: headPos.y - headRad, width: headRad * 2, height: headRad * 2)), with: .color(stickColor))
            }
            
            // 4. Front Arm
            drawArm(ctx: ctx, phaseOffset: 0, isFront: true)
        }
        
        // --- Water Lines (Two strictly stroked waves) ---
        
        let wStart = center.x - scale * 1.3
        let wEnd = center.x + scale * 1.3
        
        // Back Wave (.cyan)
        var wave1 = Path()
        
        for x in stride(from: Double(wStart), through: Double(wEnd), by: 5.0) {
            let drawX = CGFloat(x)
            let y = waterLevel1 + sin(drawX / waveLength1 + wave1Offset) * amp1
            if drawX == wStart {
                wave1.move(to: CGPoint(x: drawX, y: y))
            } else {
                wave1.addLine(to: CGPoint(x: drawX, y: y))
            }
        }
        context.stroke(wave1, with: .color(Color.cyan), style: StrokeStyle(lineWidth: 10, lineCap: .round, lineJoin: .round))
        
        // Front Wave (.blue)
        var wave2 = Path()
        let wave2Offset = t * 4.0 + 1.0
        let waveLength2: CGFloat = scale * 1.1
        let amp2: CGFloat = scale * 0.1
        let waterLevel2 = center.y + scale * 0.32
        
        for x in stride(from: Double(wStart - scale * 0.1), through: Double(wEnd + scale * 0.1), by: 5.0) {
            let drawX = CGFloat(x)
            let y = waterLevel2 + sin(drawX / waveLength2 + wave2Offset) * amp2
            if drawX == wStart - scale * 0.1 {
                wave2.move(to: CGPoint(x: drawX, y: y))
            } else {
                wave2.addLine(to: CGPoint(x: drawX, y: y))
            }
        }
        context.stroke(wave2, with: .color(Color.blue), style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        SwimmingView()
            .frame(width: 300, height: 300)
    }
}
