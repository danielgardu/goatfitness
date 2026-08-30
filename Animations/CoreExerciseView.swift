import SwiftUI
import Foundation

struct CoreExerciseView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 2.4
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate * speed
                self.drawCore(in: &context, size: size, time: t)
            }
        }
    }
    
    private func drawCore(in context: inout GraphicsContext, size: CGSize, time t: Double) {
        // Offset center slightly to the right to perfectly balance the visual weight
        let center = CGPoint(x: (size.width / 2) + (size.width * 0.10), y: size.height / 2)
        let scale = min(size.width, size.height) * 0.45 
        
        let cycle = t.truncatingRemainder(dividingBy: .pi * 2)
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        
        // Smooth ease in/out crunch cycle
        let rawProgress = (1 - cos(CGFloat(cycle))) / 2
        // Double smoothstep for a very deliberate flex and hold at the top/bottom
        let p1 = rawProgress * rawProgress * (3 - 2 * rawProgress)
        let crunchProgress = p1 * p1 * (3 - 2 * p1) 
        
        // --- Ground reference ---
        let groundY = center.y + scale * 0.25
        
        // --- Hips (planted) ---
        let hipX = center.x - scale * 0.15
        let hipY = groundY - scale * 0.05
        let hipPos = CGPoint(x: hipX, y: hipY)
        
        // --- Feet (planted) ---
        let footX = center.x + scale * 0.4
        let footY = groundY
        let footPos = CGPoint(x: footX, y: footY)
        
        // --- Legs: fixed position, knees bent up ---
        let tLen: CGFloat = scale * 0.32
        let sLen: CGFloat = scale * 0.32
        
        func solveKnee(hip: CGPoint, foot: CGPoint) -> CGPoint {
            let dx = foot.x - hip.x
            let dy = foot.y - hip.y
            var dist = sqrt(dx * dx + dy * dy)
            dist = max(1, min(dist, tLen + sLen - 1))
            let baseAngle = atan2(dy, dx)
            let cosA = (tLen * tLen + dist * dist - sLen * sLen) / (2 * tLen * dist)
            let a = acos(max(-1, min(1, cosA)))
            // Bend up -> negative Y -> subtract angle in screen space
            let kneeAngle = baseAngle - a 
            return CGPoint(
                x: hip.x + cos(kneeAngle) * tLen,
                y: hip.y + sin(kneeAngle) * tLen
            )
        }
        
        // Dynamic shifting: the feet dig in slightly as leverage changes
        let dynamicFootX = footPos.x - crunchProgress * scale * 0.04
        let dynamicFootPos = CGPoint(x: dynamicFootX, y: footPos.y)
        let dynamicKnee = solveKnee(hip: hipPos, foot: dynamicFootPos)
        
        // --- Torso curling ---
        let torsoLen: CGFloat = scale * 0.45
        
        // Angles (0 is right, pi/2 is down, pi is left, -pi/2 or 3pi/2 is up)
        let flatAngle: CGFloat = .pi + 0.05  // slightly elevated from pure flat
        let curledAngle: CGFloat = .pi + 1.15  // ~65 degrees curled up
        
        let torsoAngle = flatAngle + (curledAngle - flatAngle) * crunchProgress
        
        let shoulderPos = CGPoint(
            x: hipPos.x + cos(torsoAngle) * torsoLen,
            y: hipPos.y + sin(torsoAngle) * torsoLen
        )
        
        // --- Head ---
        let headRad: CGFloat = scale * 0.15
        let headAngle = torsoAngle - 0.15 * crunchProgress
        let headPos = CGPoint(
            x: shoulderPos.x + cos(headAngle) * headRad * 1.35,
            y: shoulderPos.y + sin(headAngle) * headRad * 1.35
        )

        // Keep goat head rotation synchronized with the crunch phase.
        let goatHeadFlatRotation: CGFloat = -.pi * 0.49   // ~-88 deg (lying down)
        let goatHeadCurledRotation: CGFloat = -.pi * 0.29 // ~-52 deg (coming up)
        let goatHeadRotation = goatHeadFlatRotation + (goatHeadCurledRotation - goatHeadFlatRotation) * crunchProgress
        
        // --- Arms: hands behind head, elbows flaring ---
        let handOffset: CGFloat = headRad * 1.3
        let handPos = CGPoint(
            x: headPos.x + cos(headAngle - .pi * 0.05) * handOffset,
            y: headPos.y + sin(headAngle - .pi * 0.05) * handOffset
        )
        
        let armMidX = (shoulderPos.x + handPos.x) / 2
        let armMidY = (shoulderPos.y + handPos.y) / 2
        
        let flareAngle = torsoAngle + .pi / 2
        let maxFlare: CGFloat = scale * 0.16
        let minFlare: CGFloat = scale * 0.08
        let elbowOffset = maxFlare - (maxFlare - minFlare) * crunchProgress
        
        let forwardShift = cos(torsoAngle + .pi) * crunchProgress * scale * 0.05
        let downwardShift = sin(torsoAngle + .pi) * crunchProgress * scale * 0.05
        
        let elbowPos = CGPoint(
            x: armMidX + cos(flareAngle) * elbowOffset + forwardShift,
            y: armMidY + sin(flareAngle) * elbowOffset + downwardShift
        )
        
        // --- Drawing ---
        // Mat
        var matPath = Path()
        matPath.move(to: CGPoint(x: center.x - scale * 0.85, y: groundY + 5))
        matPath.addLine(to: CGPoint(x: center.x + scale * 0.75, y: groundY + 5))
        context.stroke(matPath, with: .color(stickColor.opacity(0.12)),
            style: StrokeStyle(lineWidth: 8, lineCap: .round))
        
        // Back Arm
        var backArm = Path()
        backArm.move(to: shoulderPos)
        backArm.addLine(to: CGPoint(x: elbowPos.x - 3, y: elbowPos.y + 4))
        backArm.addLine(to: CGPoint(x: handPos.x - 2, y: handPos.y + 2))
        context.stroke(backArm, with: .color(stickColor.opacity(0.35)),
            style: StrokeStyle(lineWidth: 10, lineCap: .round, lineJoin: .round))
        
        // Back Leg
        var backLeg = Path()
        backLeg.move(to: hipPos)
        // Offset back leg slightly for depth
        backLeg.addLine(to: CGPoint(x: dynamicKnee.x + 4, y: dynamicKnee.y - 3))
        backLeg.addLine(to: CGPoint(x: dynamicFootPos.x + 5, y: dynamicFootPos.y))
        context.stroke(backLeg, with: .color(stickColor.opacity(0.35)),
            style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        
        // Torso
        var torsoPath = Path()
        torsoPath.move(to: shoulderPos)
        torsoPath.addLine(to: hipPos)
        context.stroke(torsoPath, with: .color(stickColor),
            style: StrokeStyle(lineWidth: 13, lineCap: .round))
        
        // Head (Goat Mode Support - Core uses cara12.png)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara12_negro" : "cara12"))
            let imgSize = headRad * 4.76
            var headContext = context
            headContext.translateBy(x: headPos.x, y: headPos.y)
            headContext.rotate(by: .radians(Double(goatHeadRotation)))
            let rect = CGRect(
                x: -imgSize / 2,
                y: -imgSize / 2 - (headRad * 0.14),
                width: imgSize,
                height: imgSize
            )
            headContext.draw(headImage, in: rect)
        } else {
            context.fill(
                Path(ellipseIn: CGRect(
                    x: headPos.x - headRad, y: headPos.y - headRad,
                    width: headRad * 2, height: headRad * 2
                )),
                with: .color(stickColor)
            )
        }
        
        // Front Leg
        var frontLeg = Path()
        frontLeg.move(to: hipPos)
        frontLeg.addLine(to: dynamicKnee)
        frontLeg.addLine(to: dynamicFootPos)
        context.stroke(frontLeg, with: .color(stickColor),
            style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        
        // Front Arm
        var frontArm = Path()
        frontArm.move(to: shoulderPos)
        frontArm.addLine(to: elbowPos)
        frontArm.addLine(to: handPos)
        context.stroke(frontArm, with: .color(stickColor),
            style: StrokeStyle(lineWidth: 10, lineCap: .round, lineJoin: .round))
        
        // Shadow
        let sW = scale * 1.5
        let shadowRect = CGRect(x: center.x - sW / 2, y: groundY + 10, width: sW, height: 6)
        context.fill(Path(ellipseIn: shadowRect), with: .color(.black.opacity(0.12)))
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        CoreExerciseView()
            .frame(width: 300, height: 300)
    }
}
