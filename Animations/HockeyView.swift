import SwiftUI
import Foundation

struct HockeyView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 4.2
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate * speed
                self.drawHockey(in: &context, size: size, time: t)
            }
        }
    }
    
    private func drawHockey(in context: inout GraphicsContext, size: CGSize, time t: Double) {
        let center = CGPoint(x: size.width * 0.5, y: size.height * 0.5)
        let scale = min(size.width, size.height) * 0.42
        
        // Animation Cycle
        let cycle = CGFloat(t.truncatingRemainder(dividingBy: .pi * 2))
        
        // --- Root: Hips & Torso ---
        let bounce = sin(cycle * 2) * scale * 0.015
        let lateralShift = sin(cycle) * scale * 0.12
        let hips = CGPoint(
            x: center.x + lateralShift,
            y: center.y + scale * 0.22 + bounce
        )
        
        let torsoLean: CGFloat = 0.65 
        let torsoLen = scale * 0.58
        let shoulders = CGPoint(
            x: hips.x + sin(torsoLean) * torsoLen,
            y: hips.y - cos(torsoLean) * torsoLen
        )
        
        let headRadius = scale * 0.16
        let headCenter = CGPoint(
            x: shoulders.x + sin(torsoLean) * headRadius * 1.3,
            y: shoulders.y - cos(torsoLean) * headRadius * 1.3
        )
        
        let colorBase: Color = colorMode == .darkStickman ? .black : .white
        
        // --- Stick Geometry ---
        let stickSway = sin(cycle) * scale * 0.03
        let stickStartPos = CGPoint(x: shoulders.x - scale * 0.24 + stickSway, y: shoulders.y + scale * 0.16)
        let stickEndPos   = CGPoint(x: stickStartPos.x + scale * 0.78, y: hips.y + scale * 0.55)
        
        // --- Hand Positions Snap to Stick ---
        let handBackPos  = CGPoint(
            x: stickStartPos.x + (stickEndPos.x - stickStartPos.x) * 0.16,
            y: stickStartPos.y + (stickEndPos.y - stickStartPos.y) * 0.16
        ) 
        let handFrontPos = CGPoint(
            x: stickStartPos.x + (stickEndPos.x - stickStartPos.x) * 0.54,
            y: stickStartPos.y + (stickEndPos.y - stickStartPos.y) * 0.54
        )
        
        // --- Arm Joints ---
        let elbowBack = CGPoint(
            x: shoulders.x - scale * 0.22 + lateralShift * 0.4,
            y: shoulders.y - scale * 0.14 + bounce
        )
        
        let elbowFront = CGPoint(
            x: shoulders.x + scale * 0.22,
            y: shoulders.y + scale * 0.28
        )

        // --- Drawing Helpers ---
        func drawLeg(phaseOffset: CGFloat, isFront: Bool) {
            let p = cycle + phaseOffset
            let opacity = isFront ? 1.0 : 0.4
            let color = colorBase.opacity(opacity)
            let width: CGFloat = 14
            
            let slide = sin(p) * scale * 0.20
            let footHeight = hips.y + scale * 0.55
            let foot = CGPoint(x: hips.x + slide, y: footHeight)
            
            let knee = CGPoint(
                x: (hips.x + foot.x) / 2 + scale * 0.08,
                y: (hips.y + foot.y) / 2 + scale * 0.15
            )
            
            var path = Path()
            path.move(to: hips)
            path.addLine(to: knee)
            path.addLine(to: foot)
            context.stroke(path, with: .color(color), style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
        }
        
        func drawArm(start: CGPoint, elbow: CGPoint, hand: CGPoint, opacity: Double) {
            var path = Path()
            path.move(to: start)
            path.addLine(to: elbow)
            path.addLine(to: hand)
            context.stroke(path, with: .color(colorBase.opacity(opacity)), style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        }

        // --- Render Layers ---
        
        // 1. Ice shadow
        let sW = scale * 1.0
        let shadowRect = CGRect(x: center.x - sW/2 + lateralShift, y: hips.y + scale * 0.58, width: sW, height: 10)
        context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(0.25)))

        // 2. Back Arm
        drawArm(start: shoulders, elbow: elbowBack, hand: handBackPos, opacity: 0.4)
        
        // 3. Back Leg
        drawLeg(phaseOffset: .pi, isFront: false)
        
        // 4. Hockey Stick
        var stickPath = Path()
        stickPath.move(to: stickStartPos)
        stickPath.addLine(to: stickEndPos)
        context.stroke(stickPath, with: .color(colorBase), style: StrokeStyle(lineWidth: 8, lineCap: .butt))
        
        var blade = Path()
        blade.move(to: stickEndPos)
        blade.addLine(to: CGPoint(x: stickEndPos.x + scale * 0.28, y: stickEndPos.y - scale * 0.04))
        context.stroke(blade, with: .color(colorBase), style: StrokeStyle(lineWidth: 11, lineCap: .round))
        
        // 5. Torso
        var torso = Path()
        torso.move(to: shoulders)
        torso.addLine(to: hips)
        context.stroke(torso, with: .color(colorBase), style: StrokeStyle(lineWidth: 16, lineCap: .round))
        
        // 6. Head (Goat Mode Support - Hockey uses cara12.png)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara12_negro" : "cara12"))
            let imgSize = headRadius * 4.76
            let rect = CGRect(
                x: headCenter.x - imgSize/2,
                y: headCenter.y - imgSize/2 - (headRadius * 0.14),
                width: imgSize,
                height: imgSize
            )
            context.draw(headImage, in: rect)
        } else {
            context.fill(Path(ellipseIn: CGRect(x: headCenter.x - headRadius, y: headCenter.y - headRadius, width: headRadius * 2, height: headRadius * 2)), with: .color(colorBase))
        }
        
        // 7. Front Leg
        drawLeg(phaseOffset: 0, isFront: true)
        
        // 8. Front Arm
        drawArm(start: shoulders, elbow: elbowFront, hand: handFrontPos, opacity: 1.0)
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        HockeyView()
            .frame(width: 400, height: 400)
    }
}
