import SwiftUI
import Foundation

struct HIITView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 4.5
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
        let scale = min(size.width, size.height) * 0.38
        
        let cycle = t.truncatingRemainder(dividingBy: .pi * 2)
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        
        // Jumping jack cycle
        let rawProgress = (1 - cos(CGFloat(cycle))) / 2
        let jumpProgress = rawProgress * rawProgress * (3 - 2 * rawProgress)
        
        // --- Jump height ---
        let jumpHeight: CGFloat = jumpProgress * scale * 0.18
        let groundY = center.y + scale * 0.6
        
        // --- Hips (center, lifted during jump) ---
        let hipY = groundY - jumpHeight - scale * 0.45
        let hipPos = CGPoint(x: center.x, y: hipY)
        
        // --- Torso ---
        let torsoLen: CGFloat = scale * 0.45
        let shoulderPos = CGPoint(x: center.x, y: hipPos.y - torsoLen)
        
        // --- Head ---
        let headRad: CGFloat = scale * 0.16
        let headPos = CGPoint(x: center.x, y: shoulderPos.y - headRad * 1.3)
        
        // --- Feet (spread apart during jump) ---
        let maxSpread: CGFloat = scale * 0.5
        let minSpread: CGFloat = scale * 0.05
        let footSpread = minSpread + (maxSpread - minSpread) * jumpProgress
        let feetY = groundY - jumpHeight
        let leftFoot = CGPoint(x: center.x - footSpread, y: feetY)
        let rightFoot = CGPoint(x: center.x + footSpread, y: feetY)
        
        // --- Knees (slight outward bow during spread) ---
        let kneeBow: CGFloat = jumpProgress * scale * 0.06
        let leftKnee = CGPoint(
            x: (leftFoot.x + hipPos.x) / 2 - kneeBow,
            y: (leftFoot.y + hipPos.y) / 2
        )
        let rightKnee = CGPoint(
            x: (rightFoot.x + hipPos.x) / 2 + kneeBow,
            y: (rightFoot.y + hipPos.y) / 2
        )
        
        // --- Arms (sweep from sides to overhead) ---
        // Using direct arc: angle from pointing straight down (0) sweeping outward to overhead
        let armLen: CGFloat = scale * 0.44
        let upperArmLen: CGFloat = armLen * 0.55
        let forearmLen: CGFloat = armLen * 0.45
        
        // Sweep from ~5° to ~155° (not full 180 for natural look)
        let sweepAngle: CGFloat = 0.08 + jumpProgress * (.pi * 0.82)
        
        // Left arm
        let lElbow = CGPoint(
            x: shoulderPos.x - sin(sweepAngle) * upperArmLen,
            y: shoulderPos.y + cos(sweepAngle) * upperArmLen
        )
        let lForearmAngle = sweepAngle + 0.08 // tiny outward bend
        let lHand = CGPoint(
            x: lElbow.x - sin(lForearmAngle) * forearmLen,
            y: lElbow.y + cos(lForearmAngle) * forearmLen
        )
        
        // Right arm
        let rElbow = CGPoint(
            x: shoulderPos.x + sin(sweepAngle) * upperArmLen,
            y: shoulderPos.y + cos(sweepAngle) * upperArmLen
        )
        let rHand = CGPoint(
            x: rElbow.x + sin(lForearmAngle) * forearmLen,
            y: rElbow.y + cos(lForearmAngle) * forearmLen
        )
        
        // --- Drawing ---
        
        // Left arm (back)
        var lArmPath = Path()
        lArmPath.move(to: shoulderPos)
        lArmPath.addLine(to: lElbow)
        lArmPath.addLine(to: lHand)
        context.stroke(lArmPath, with: .color(stickColor.opacity(0.35)),
            style: StrokeStyle(lineWidth: 10, lineCap: .round, lineJoin: .round))
        
        // Left leg (back)
        var lLegPath = Path()
        lLegPath.move(to: hipPos)
        lLegPath.addLine(to: leftKnee)
        lLegPath.addLine(to: leftFoot)
        context.stroke(lLegPath, with: .color(stickColor.opacity(0.35)),
            style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        
        // Head (Goat Mode Support - HIIT uses cara1.png specifically)
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
                Path(ellipseIn: CGRect(
                    x: headPos.x - headRad, y: headPos.y - headRad,
                    width: headRad * 2, height: headRad * 2
                )),
                with: .color(stickColor)
            )
        }
        
        // Torso
        var torsoPath = Path()
        torsoPath.move(to: shoulderPos)
        torsoPath.addLine(to: hipPos)
        context.stroke(torsoPath, with: .color(stickColor),
            style: StrokeStyle(lineWidth: 13, lineCap: .round))
        
        // Right leg (front)
        var rLegPath = Path()
        rLegPath.move(to: hipPos)
        rLegPath.addLine(to: rightKnee)
        rLegPath.addLine(to: rightFoot)
        context.stroke(rLegPath, with: .color(stickColor),
            style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        
        // Right arm (front)
        var rArmPath = Path()
        rArmPath.move(to: shoulderPos)
        rArmPath.addLine(to: rElbow)
        rArmPath.addLine(to: rHand)
        context.stroke(rArmPath, with: .color(stickColor),
            style: StrokeStyle(lineWidth: 10, lineCap: .round, lineJoin: .round))
        
        // Shadow
        let shadowScale: CGFloat = 1 - jumpProgress * 0.35
        let shadowOpacity: Double = 0.2 * Double(1 - jumpProgress * 0.5)
        let sW = scale * 0.7 * shadowScale
        let shadowRect = CGRect(x: center.x - sW / 2, y: groundY + 5, width: sW, height: 7)
        context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(shadowOpacity)))
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        HIITView()
            .frame(width: 300, height: 300)
    }
}
