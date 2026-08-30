import SwiftUI
import Foundation

struct WeightlifterView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 2.8
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                self.draw(in: &context, size: size, time: timeline.date.timeIntervalSinceReferenceDate)
            }
        }
    }
    
    private func draw(in context: inout GraphicsContext, size: CGSize, time: Double) {
        let timeValue: Double = time * speed
        // Set the floor/feet to 85% of height to balance the body in the vertical space
        let centerPoint = CGPoint(x: size.width / 2, y: size.height * 0.85)
        let baseDimension: CGFloat = min(size.width, size.height) * 0.38
        
        let rawCycle: Double = timeValue.truncatingRemainder(dividingBy: Double.pi * 2)
        let phaseProgress: Double = rawCycle / (Double.pi * 2)
        
        func easeInOut(_ t: Double) -> Double {
            return t < 0.5 ? 2 * t * t : 1 - pow(-2 * t + 2, 2) / 2
        }
        
        var bodyExtension: Double = 1.0
        var barHeightProgress: Double = 0
        var armExtension: Double = 0
        var tremblingValue: Double = 0
        
        // CONTINUOUS CYCLE: starts and ends at bodyExtension=1.0, bar=0
        if phaseProgress < 0.18 {
            let p = easeInOut(phaseProgress / 0.18)
            bodyExtension = 1.0 - p * 0.3
            barHeightProgress = 0
        } else if phaseProgress < 0.4 {
            let p = easeInOut((phaseProgress - 0.18) / 0.22)
            bodyExtension = 0.7 + p * 0.3
            barHeightProgress = p * 0.4
        } else if phaseProgress < 0.6 {
            let p = easeInOut((phaseProgress - 0.4) / 0.2)
            bodyExtension = 1.0
            barHeightProgress = 0.4 + p * 0.6
            armExtension = p
        } else if phaseProgress < 0.72 {
            bodyExtension = 1.0
            barHeightProgress = 1.0
            armExtension = 1.0
            tremblingValue = 1.2 * sin(timeValue * 35)
        } else {
            let p = easeInOut((phaseProgress - 0.72) / 0.28)
            bodyExtension = 1.0
            barHeightProgress = 1.0 - p
            armExtension = 1.0 - p
            tremblingValue = (1.0 - p) * 1.0 * sin(timeValue * 35)
        }
        
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        let footSpread: CGFloat = 26
        let leftFoot = CGPoint(x: centerPoint.x - footSpread, y: centerPoint.y)
        let rightFoot = CGPoint(x: centerPoint.x + footSpread, y: centerPoint.y)
        
        let legLen: CGFloat = baseDimension * 0.58
        let hipOffsetY: CGFloat = CGFloat(bodyExtension) * legLen
        let hipPosition = CGPoint(x: centerPoint.x, y: centerPoint.y - hipOffsetY)
        
        let kneeSpread: CGFloat = 10
        let leftKneePos = CGPoint(
            x: (leftFoot.x + hipPosition.x) / 2 - kneeSpread,
            y: (leftFoot.y + hipPosition.y) / 2 + 3
        )
        let rightKneePos = CGPoint(
            x: (rightFoot.x + hipPosition.x) / 2 + kneeSpread,
            y: (rightFoot.y + hipPosition.y) / 2 + 3
        )
        
        let torsoLen: CGFloat = baseDimension * 0.42
        let shoulderPosition = CGPoint(x: hipPosition.x, y: hipPosition.y - torsoLen)
        
        let hRadius: CGFloat = baseDimension * 0.19
        let headPos = CGPoint(x: shoulderPosition.x, y: shoulderPosition.y - hRadius * 1.3)
        
        let barBaseY: CGFloat = shoulderPosition.y + 12
        let barTravel: CGFloat = CGFloat(barHeightProgress) * baseDimension * 0.9
        let barYPos: CGFloat = barBaseY - barTravel + CGFloat(tremblingValue)
        
        let barW: CGFloat = baseDimension * 1.8
        let bLeft: CGFloat = shoulderPosition.x - barW / 2
        let bRight: CGFloat = shoulderPosition.x + barW / 2
        
        let handSpread: CGFloat = 55
        let lHand = CGPoint(x: shoulderPosition.x - handSpread, y: barYPos)
        let rHand = CGPoint(x: shoulderPosition.x + handSpread, y: barYPos)
        
        let armBow: CGFloat = 10 * CGFloat(1 - armExtension)
        let lElbow = CGPoint(
            x: (shoulderPosition.x + lHand.x) / 2 - armBow,
            y: (shoulderPosition.y + lHand.y) / 2 + armBow
        )
        let rElbow = CGPoint(
            x: (shoulderPosition.x + rHand.x) / 2 + armBow,
            y: (shoulderPosition.y + rHand.y) / 2 + armBow
        )
        
        // --- Drawing ---
        
        // Head (Goat Mode Support - Weightlifter uses cara9frente.png)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara9frente_negro" : "cara9frente"))
            let imgSize = hRadius * 4.708 // 10% larger
            let rect = CGRect(
                x: headPos.x - imgSize * 0.45, // 5% left shift from current (net 5% right shift)
                y: headPos.y - imgSize/2 - (hRadius * 0.26) - (imgSize * 0.01), // 1% more up
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
            style: StrokeStyle(lineWidth: 13, lineCap: .round))
        
        func drawLeg(foot: CGPoint, knee: CGPoint, hip: CGPoint) {
            var p = Path()
            p.move(to: foot)
            p.addLine(to: knee)
            p.addLine(to: hip)
            context.stroke(p, with: .color(stickColor),
                style: StrokeStyle(lineWidth: 13, lineCap: .round, lineJoin: .round))
        }
        drawLeg(foot: leftFoot, knee: leftKneePos, hip: hipPosition)
        drawLeg(foot: rightFoot, knee: rightKneePos, hip: hipPosition)
        
        func drawArm(sh: CGPoint, el: CGPoint, ha: CGPoint) {
            var p = Path()
            p.move(to: sh)
            p.addLine(to: el)
            p.addLine(to: ha)
            context.stroke(p, with: .color(stickColor),
                style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        }
        drawArm(sh: shoulderPosition, el: lElbow, ha: lHand)
        drawArm(sh: shoulderPosition, el: rElbow, ha: rHand)
        
        var barPath = Path()
        barPath.move(to: CGPoint(x: bLeft, y: barYPos))
        barPath.addLine(to: CGPoint(x: bRight, y: barYPos))
        context.stroke(barPath, with: .color(stickColor),
            style: StrokeStyle(lineWidth: 4.5, lineCap: .round))
        
        func drawPlates(at x: CGFloat) {
            for i in 0..<2 {
                let offset = CGFloat(i) * 9
                let xPos = x - 5 + (x < shoulderPosition.x ? -offset : offset)
                let plateRect = CGRect(x: xPos, y: barYPos - 22, width: 10, height: 44)
                context.fill(Path(roundedRect: plateRect, cornerRadius: 3), with: .color(stickColor))
            }
        }
        drawPlates(at: bLeft)
        drawPlates(at: bRight)
        
        let sWidth: CGFloat = baseDimension * 1.2
        let sRect = CGRect(x: centerPoint.x - sWidth / 2, y: centerPoint.y + 5, width: sWidth, height: 8)
        context.fill(Path(ellipseIn: sRect), with: .color(stickColor.opacity(0.07)))
    }
}

#Preview {
    WeightlifterView()
        .preferredColorScheme(.dark)
}
