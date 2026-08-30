import SwiftUI
import Foundation

struct SkullCrusherView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 1.4
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                self.draw(in: &context, size: size, time: timeline.date.timeIntervalSinceReferenceDate)
            }
        }
    }
    
    private func draw(in context: inout GraphicsContext, size: CGSize, time: Double) {
        // Center the 300x300 drawing area within the actual canvas (500x500)
        // and apply an additional y-offset to move it lower as requested.
        
         // Force internal math to 300x300 base
        let timeValue: Double = time * speed
        let centerPoint = CGPoint(x: size.width / 2, y: size.height / 2)
        let baseDimension: CGFloat = min(size.width, size.height) * 0.42
        
        let rawCycle: Double = timeValue.truncatingRemainder(dividingBy: Double.pi * 2)
        let phaseProgress: Double = rawCycle / (Double.pi * 2)
        
        func easeInOut(_ t: Double) -> Double {
            return t < 0.5 ? 2 * t * t : 1 - pow(-2 * t + 2, 2) / 2
        }
        
        var lowerProgress: Double = 0
        
        // 0.0 -> 0.15: Hold at top
        // 0.15 -> 0.50: Lowering (to head)
        // 0.50 -> 0.65: Hold at bottom
        // 0.65 -> 0.90: Pressing (to top)
        // 0.90 -> 1.00: Reset
        
        if phaseProgress < 0.15 {
            lowerProgress = 0
        } else if phaseProgress < 0.5 {
            let p = easeInOut((phaseProgress - 0.15) / 0.35)
            lowerProgress = p
        } else if phaseProgress < 0.65 {
            lowerProgress = 1.0
        } else if phaseProgress < 0.9 {
            let p = easeInOut((phaseProgress - 0.65) / 0.25)
            lowerProgress = 1.0 - p
        } else {
            lowerProgress = 0
        }
        
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        
        // --- LAYOUT CONSTANTS (Same as Bench Press) ---
        let benchTop = centerPoint.y + 15
        let floorY = benchTop + 45 
        let benchLength = baseDimension * 1.5
        let padHeight: CGFloat = 11
        
        // --- STICKMAN POSITIONS ---
        let shoulderPos = CGPoint(x: centerPoint.x - baseDimension * 0.22, y: benchTop - 7)
        let hipPos = CGPoint(x: centerPoint.x + baseDimension * 0.38, y: benchTop - 7)
        let hRadius: CGFloat = baseDimension * 0.17
        let headCenter = CGPoint(x: shoulderPos.x - hRadius * 1.5, y: benchTop - 7)

        let segmentLen: CGFloat = baseDimension * 0.4
        
        // --- FIXED ELBOW ANGLE ---
        let upperArmAngle: CGFloat = Double.pi * 0.5 // Perfectly vertical (90 degrees)
        
        // Front Arm Points
        let frontElbow = CGPoint(
            x: shoulderPos.x + cos(upperArmAngle) * segmentLen,
            y: shoulderPos.y - sin(upperArmAngle) * segmentLen
        )
        let fStartAngle = upperArmAngle
        let fEndAngle = upperArmAngle + Double.pi * 0.6 // Bend towards the head
        let fCurrentAngle = fStartAngle + CGFloat(lowerProgress) * (fEndAngle - fStartAngle)
        let handPos = CGPoint(
            x: frontElbow.x + cos(fCurrentAngle) * segmentLen,
            y: frontElbow.y - sin(fCurrentAngle) * segmentLen
        )
        
        // Back Arm Points (slightly offset for depth)
        let bShoulder = CGPoint(x: shoulderPos.x + 8, y: shoulderPos.y - 3)
        let backElbow = CGPoint(
            x: bShoulder.x + cos(upperArmAngle) * segmentLen,
            y: bShoulder.y - sin(upperArmAngle) * segmentLen
        )
        let backHand = CGPoint(
            x: backElbow.x + cos(fCurrentAngle) * segmentLen,
            y: backElbow.y - sin(fCurrentAngle) * segmentLen
        )

        // --- 0. FAR SIDE BARBELL DISC (Behind everything) ---
        let plateR = baseDimension * 0.22
        let plateColor = Color(white: 0.35)
        let depthOffset: CGFloat = 8
        let farPos = CGPoint(x: handPos.x + depthOffset, y: handPos.y - 1)
        let farRect = CGRect(x: farPos.x - plateR, y: farPos.y - plateR, width: plateR*2, height: plateR*2)
        context.fill(Path(ellipseIn: farRect), with: .color(plateColor.opacity(0.6)))
        context.stroke(Path(ellipseIn: farRect), with: .color((colorMode == .darkStickman ? Color.black : Color.white).opacity(0.2)), style: StrokeStyle(lineWidth: 2))
        
        // --- 1. BENCH ---
        let benchPad = Path(roundedRect: CGRect(x: centerPoint.x - benchLength * 0.45, y: benchTop, width: benchLength, height: padHeight), cornerRadius: 4)
        context.fill(benchPad, with: .color(stickColor.opacity(0.8)))
        
        let legColor = stickColor.opacity(0.5)
        var benchLegP = Path()
        benchLegP.move(to: CGPoint(x: centerPoint.x - benchLength * 0.25, y: benchTop + padHeight))
        benchLegP.addLine(to: CGPoint(x: centerPoint.x - benchLength * 0.28, y: floorY))
        benchLegP.move(to: CGPoint(x: centerPoint.x + benchLength * 0.3, y: benchTop + padHeight))
        benchLegP.addLine(to: CGPoint(x: centerPoint.x + benchLength * 0.33, y: floorY))
        context.stroke(benchLegP, with: .color(legColor), style: StrokeStyle(lineWidth: 10, lineCap: .round))
        
        // --- 2. BACK LEG ---
        let backHip = CGPoint(x: hipPos.x + 4, y: hipPos.y - 2)
        let backKnee = CGPoint(x: backHip.x + baseDimension * 0.2, y: benchTop + 5)
        let backFoot = CGPoint(x: backKnee.x + baseDimension * 0.05, y: floorY - 5)
        var backLegP = Path()
        backLegP.move(to: backHip)
        backLegP.addLine(to: backKnee)
        backLegP.addLine(to: backFoot)
        context.stroke(backLegP, with: .color(stickColor.opacity(0.35)), style: StrokeStyle(lineWidth: 13, lineCap: .round, lineJoin: .round))
        
        // --- 3. BACK ARM ---
        var backArmP = Path()
        backArmP.move(to: bShoulder)
        backArmP.addLine(to: backElbow)
        backArmP.addLine(to: backHand)
        context.stroke(backArmP, with: .color(stickColor.opacity(0.35)), style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        
        // --- 4. TORSO ---
        var torsoPath = Path()
        torsoPath.move(to: shoulderPos)
        torsoPath.addLine(to: hipPos)
        context.stroke(torsoPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 13, lineCap: .round))
        
        // --- 5. HEAD ---
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara13_negro" : "cara13"))
            let imgSize = hRadius * 4.4
            var headContext = context
            headContext.translateBy(x: headCenter.x, y: headCenter.y)
            headContext.rotate(by: .degrees(-90))
            let rect = CGRect(x: -imgSize/2, y: -imgSize/2 - (hRadius * 0.1), width: imgSize, height: imgSize)
            headContext.draw(headImage, in: rect)
        } else {
            context.fill(Path(ellipseIn: CGRect(x: headCenter.x - hRadius, y: headCenter.y - hRadius, width: hRadius * 2, height: hRadius * 2)), with: .color(stickColor))
        }
        
        // --- 6. FRONT LEG ---
        let frontKnee = CGPoint(x: hipPos.x + baseDimension * 0.18, y: benchTop + 8)
        let frontFoot = CGPoint(x: frontKnee.x + baseDimension * 0.05, y: floorY - 2)
        var frontLegP = Path()
        frontLegP.move(to: hipPos)
        frontLegP.addLine(to: frontKnee)
        frontLegP.addLine(to: frontFoot)
        context.stroke(frontLegP, with: .color(stickColor), style: StrokeStyle(lineWidth: 13, lineCap: .round, lineJoin: .round))
        
        // --- 7. FRONT ARM ---
        var armP = Path()
        armP.move(to: shoulderPos)
        armP.addLine(to: frontElbow)
        armP.addLine(to: handPos)
        context.stroke(armP, with: .color(stickColor), style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))

        // --- 8. NEAR SIDE BARBELL DISC (In front) ---
        let nearRect = CGRect(x: handPos.x - plateR, y: handPos.y - plateR, width: plateR*2, height: plateR*2)
        context.fill(Path(ellipseIn: nearRect), with: .color(plateColor))
        context.stroke(Path(ellipseIn: nearRect), with: .color((colorMode == .darkStickman ? Color.black : Color.white).opacity(0.9)), style: StrokeStyle(lineWidth: 3))
        
        let hubR = plateR * 0.65
        context.fill(Path(ellipseIn: CGRect(x: handPos.x - hubR, y: handPos.y - hubR, width: hubR*2, height: hubR*2)), with: .color(Color(white: 0.2)))
        context.stroke(Path(ellipseIn: CGRect(x: handPos.x - hubR, y: handPos.y - hubR, width: hubR*2, height: hubR*2)), with: .color((colorMode == .darkStickman ? Color.black : Color.white).opacity(0.4)), style: StrokeStyle(lineWidth: 1))
        
        context.fill(Path(ellipseIn: CGRect(x: handPos.x - 5, y: handPos.y - 5, width: 10, height: 10)), with: .color(colorMode == .darkStickman ? .black : .white))
    }
}

#Preview {
    SkullCrusherView()
        .preferredColorScheme(.dark)
}
