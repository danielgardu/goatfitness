import SwiftUI
import Foundation

struct IdleView: View, Animatable {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 1.0
    var isGoatMode: Bool = false
    var torsoThickness: CGFloat = 13
    var saluteProgress: Double = 0.0
    
    var animatableData: Double {
        get { saluteProgress }
        set { saluteProgress = newValue }
    }
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                self.draw(in: &context, size: size, time: timeline.date.timeIntervalSinceReferenceDate)
            }
        }
    }
    
    private func draw(in context: inout GraphicsContext, size: CGSize, time: Double) {
        let timeValue: Double = time * speed
        // Set the floor/feet to 82% of height to balance the 217px tall body perfectly in the 300px canvas
        let centerPoint = CGPoint(x: size.width / 2, y: size.height * 0.82)
        let baseDimension: CGFloat = min(size.width, size.height) * 0.42
        
        let breathCycle = sin(timeValue * .pi * 2 / 2.5) // 2.5 seconds per breath
        let breathFactor = (breathCycle + 1) / 2 // 0 to 1
        
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        
        let footSpread: CGFloat = 12
        let leftFoot = CGPoint(x: centerPoint.x - footSpread, y: centerPoint.y)
        let rightFoot = CGPoint(x: centerPoint.x + footSpread, y: centerPoint.y)
        
        let legLen: CGFloat = baseDimension * 0.58
        let hipOffsetY: CGFloat = legLen * (0.98 + breathFactor * 0.02)
        let hipPosition = CGPoint(x: centerPoint.x, y: centerPoint.y - hipOffsetY)
        
        let kneeSpread: CGFloat = 1
        let leftKneePos = CGPoint(
            x: (leftFoot.x + hipPosition.x) / 2 - kneeSpread,
            y: (leftFoot.y + hipPosition.y) / 2 + 2
        )
        let rightKneePos = CGPoint(
            x: (rightFoot.x + hipPosition.x) / 2 + kneeSpread,
            y: (rightFoot.y + hipPosition.y) / 2 + 2
        )
        
        let torsoLen: CGFloat = baseDimension * 0.42 * (0.97 + breathFactor * 0.03) // Torso expands slightly
        let shoulderPosition = CGPoint(x: hipPosition.x, y: hipPosition.y - torsoLen)
        
        let hRadius: CGFloat = baseDimension * 0.19
        let headPos = CGPoint(x: shoulderPosition.x, y: shoulderPosition.y - hRadius * 1.3)
        
        let armLen: CGFloat = baseDimension * 0.5
        let handSpread: CGFloat = 20
        let elbowSpread: CGFloat = 12
        
        // --- Normal Right Arm (Idle) ---
        let rElbow = CGPoint(
            x: shoulderPosition.x + elbowSpread,
            y: shoulderPosition.y + armLen * 0.45
        )
        let rHand = CGPoint(x: shoulderPosition.x + handSpread, y: shoulderPosition.y + armLen * 0.9)
        
        // --- Left Arm (Lerping for Salute) ---
        let lElbowIdle = CGPoint(
            x: shoulderPosition.x - elbowSpread,
            y: shoulderPosition.y + armLen * 0.45
        )
        let lHandIdle = CGPoint(x: shoulderPosition.x - handSpread, y: shoulderPosition.y + armLen * 0.9)
        
        // --- Salute Positions (Left Side) ---
        let saluteElbow = CGPoint(
            x: shoulderPosition.x - baseDimension * 0.42, 
            y: shoulderPosition.y - baseDimension * 0.12
        )
        let saluteHand = CGPoint(
            x: headPos.x - hRadius * 0.82, 
            y: headPos.y - hRadius * 0.45
        )
        
        // --- Interpolate Left Arm ---
        let lElbow = CGPoint(
            x: lElbowIdle.x + (saluteElbow.x - lElbowIdle.x) * saluteProgress,
            y: lElbowIdle.y + (saluteElbow.y - lElbowIdle.y) * saluteProgress
        )
        let lHand = CGPoint(
            x: lHandIdle.x + (saluteHand.x - lHandIdle.x) * saluteProgress,
            y: lHandIdle.y + (saluteHand.y - lHandIdle.y) * saluteProgress
        )
        
        // --- Drawing ---
        
        if isGoatMode {
            let headImage = context.resolve(Image("CARAcuernudalarga"))
            let imgSize = hRadius * 4.708 * 1.35
            let rect = CGRect(
                x: headPos.x - imgSize * 0.50,
                y: headPos.y - imgSize/2 - (hRadius * 0.26),
                width: imgSize,
                height: imgSize
            )
            context.draw(headImage, in: rect)
        } else {
            context.fill(
                Path(ellipseIn: CGRect(
                    x: headPos.x - hRadius, y: headPos.y - hRadius,
                    width: hRadius * 2, height: hRadius * 2
                )),
                with: .color(stickColor)
            )
        }
        
        var torsoPath = Path()
        torsoPath.move(to: shoulderPosition)
        torsoPath.addLine(to: hipPosition)
        context.stroke(torsoPath, with: .color(stickColor),
            style: StrokeStyle(lineWidth: torsoThickness, lineCap: .round))
        
        func drawLeg(foot: CGPoint, knee: CGPoint, hip: CGPoint) {
            var p = Path()
            p.move(to: foot)
            p.addLine(to: knee)
            p.addLine(to: hip)
            context.stroke(p, with: .color(stickColor),
                style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        }
        drawLeg(foot: leftFoot, knee: leftKneePos, hip: hipPosition)
        drawLeg(foot: rightFoot, knee: rightKneePos, hip: hipPosition)
        
        func drawArm(sh: CGPoint, el: CGPoint, ha: CGPoint) {
            var p = Path()
            p.move(to: sh)
            p.addLine(to: el)
            p.addLine(to: ha)
            context.stroke(p, with: .color(stickColor),
                style: StrokeStyle(lineWidth: 10, lineCap: .round, lineJoin: .round))
        }
        drawArm(sh: shoulderPosition, el: lElbow, ha: lHand)
        drawArm(sh: shoulderPosition, el: rElbow, ha: rHand)
        
        let sWidth: CGFloat = baseDimension * 1.0
        let sRect = CGRect(x: centerPoint.x - sWidth / 2, y: centerPoint.y + 5, width: sWidth, height: 6)
        context.fill(Path(ellipseIn: sRect), with: .color(stickColor.opacity(0.07)))
    }
}

// MARK: - Scaled Idle View
struct ScaledIdleView: View {
    @Environment(\.animationColorMode) private var colorMode
    var isGoatMode: Bool = false
    var size: CGFloat = 120
    var useNativeRendering: Bool = false
    var torsoThickness: CGFloat? = nil
    var saluteProgress: Double = 0.0
    var customNativeSize: CGFloat? = nil
    
    private var actualNativeSize: CGFloat { customNativeSize ?? 300 }
    private var scale: CGFloat { size / actualNativeSize }
    
    var body: some View {
        Group {
            if useNativeRendering {
                IdleView(
                    isGoatMode: isGoatMode,
                    torsoThickness: torsoThickness ?? 13,
                    saluteProgress: saluteProgress
                )
                .frame(width: size, height: size)
            } else {
                IdleView(
                    isGoatMode: isGoatMode,
                    torsoThickness: torsoThickness ?? 13,
                    saluteProgress: saluteProgress
                )
                .frame(width: actualNativeSize, height: actualNativeSize)
                .scaleEffect(scale)
                .frame(width: size, height: size)
            }
        }
        .allowsHitTesting(false)
    }
}

#Preview {
    ScaledIdleView(isGoatMode: true, size: 180)
        .preferredColorScheme(.dark)
}
