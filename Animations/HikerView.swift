import SwiftUI
import Foundation

struct HikerView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 3.0
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                draw(context: &context, size: size, timeline: timeline)
            }
        }
    }
    
    private func draw(context: inout GraphicsContext, size: CGSize, timeline: TimelineViewDefaultContext) {
        let t = timeline.date.timeIntervalSinceReferenceDate * speed
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let scale = min(size.width, size.height) * 0.4
        
        let cycle = t.truncatingRemainder(dividingBy: .pi * 2)
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        
        // --- Root: Hips with subtle bounce ---
        let bounce = abs(sin(CGFloat(cycle * 2))) * 2.5
        let hips = CGPoint(x: center.x, y: center.y + bounce)
        
        // --- Torso & Head (slight forward lean) ---
        let leanAngle: CGFloat = -0.1
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
        
        let armLen = scale * 0.5
        let legLen = scale * 0.55
        
        // --- Backpack ---
        let bpWidth: CGFloat = scale * 0.25
        let bpHeight: CGFloat = scale * 0.35
        let bpX = shoulders.x - bpWidth * 0.8 + sin(leanAngle) * bpHeight * 0.3
        let bpY = shoulders.y - bpHeight * 0.1
        let bpRect = CGRect(x: bpX, y: bpY, width: bpWidth, height: bpHeight)
        context.fill(
            Path(roundedRect: bpRect, cornerRadius: 6),
            with: .color(stickColor.opacity(0.3))
        )
        context.stroke(
            Path(roundedRect: bpRect, cornerRadius: 6),
            with: .color(stickColor.opacity(0.5)),
            style: StrokeStyle(lineWidth: 2.5, lineCap: .round)
        )
        // Backpack strap
        var strapPath = Path()
        strapPath.move(to: CGPoint(x: bpX + bpWidth, y: bpY + 3))
        strapPath.addLine(to: CGPoint(x: shoulders.x + 4, y: shoulders.y + 5))
        context.stroke(strapPath, with: .color(stickColor.opacity(0.4)),
            style: StrokeStyle(lineWidth: 2.5, lineCap: .round))
        
        // --- Limb drawing ---
        func drawLimb(start: CGPoint, phase: Double, isArm: Bool, isFront: Bool) {
            let p = cycle + phase
            let color = isFront ? stickColor : stickColor.opacity(0.4)
            let width: CGFloat = isArm ? 10 : 12
            
            if isArm {
                let upperAngle = sin(CGFloat(p)) * 0.55
                let elbowAngle = upperAngle + 0.6
                
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
                context.stroke(path, with: .color(color),
                    style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
                
                // If this is the back arm (has pole), draw hiking pole
                if !isFront {
                    let poleBottom = CGPoint(
                        x: hand.x - scale * 0.08,
                        y: center.y + scale * 0.65
                    )
                    var polePath = Path()
                    polePath.move(to: hand)
                    polePath.addLine(to: poleBottom)
                    context.stroke(polePath, with: .color(color),
                        style: StrokeStyle(lineWidth: 3.5, lineCap: .round))
                    
                    // Pole tip
                    let tipSize: CGFloat = 4
                    context.fill(
                        Path(ellipseIn: CGRect(
                            x: poleBottom.x - tipSize/2, y: poleBottom.y - tipSize/2,
                            width: tipSize, height: tipSize
                        )),
                        with: .color(color)
                    )
                }
            } else {
                let swing = sin(CGFloat(p)) * 0.5
                let upperAngle = swing
                // Knee bends during the forward swing to clear the ground, straightens when planted
                let kneeFold = max(cos(CGFloat(p)) * 0.8, 0.1)
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
                context.stroke(path, with: .color(color),
                    style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
            }
        }
        
        // Back limbs
        drawLimb(start: shoulders, phase: .pi, isArm: true, isFront: false)
        drawLimb(start: hips, phase: 0, isArm: false, isFront: false)
        
        // --- Head (Goat Mode Support) ---
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara6_negro" : "cara6"))
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
                Path(ellipseIn: CGRect(
                    x: headPos.x - headRad, y: headPos.y - headRad,
                    width: headRad * 2, height: headRad * 2
                )),
                with: .color(stickColor)
            )
        }
        
        // Torso
        var torsoPath = Path()
        torsoPath.move(to: shoulders)
        torsoPath.addLine(to: hips)
        context.stroke(torsoPath, with: .color(stickColor),
            style: StrokeStyle(lineWidth: 13, lineCap: .round))
        
        // Front limbs
        drawLimb(start: hips, phase: .pi, isArm: false, isFront: true)
        drawLimb(start: shoulders, phase: 0, isArm: true, isFront: true)
        
        // Shadow
        let sW = scale * 0.8
        let shadowRect = CGRect(x: center.x - sW / 2, y: center.y + scale * 0.7, width: sW, height: 8)
        context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(0.25)))
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        HikerView()
            .frame(width: 300, height: 300)
    }
}
