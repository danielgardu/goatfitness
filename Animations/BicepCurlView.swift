import SwiftUI
import Foundation

struct BicepCurlView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 1.8
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
        let centerPoint = CGPoint(x: size.width / 2, y: size.height / 2) // Baseline within the 300 area
        let baseDimension: CGFloat = min(size.width, size.height) * 0.42
        
        let rawCycle: Double = timeValue.truncatingRemainder(dividingBy: Double.pi * 2)
        let phaseProgress: Double = rawCycle / (Double.pi * 2)
        
        func easeInOut(_ t: Double) -> Double {
            return t < 0.5 ? 2 * t * t : 1 - pow(-2 * t + 2, 2) / 2
        }
        
        var curlProgress: Double = 0
        
        if phaseProgress < 0.1 {
            curlProgress = 0
        } else if phaseProgress < 0.45 {
            let p = easeInOut((phaseProgress - 0.1) / 0.35)
            curlProgress = p
        } else if phaseProgress < 0.55 {
            curlProgress = 1.0
        } else if phaseProgress < 0.9 {
            let p = easeInOut((phaseProgress - 0.55) / 0.35)
            curlProgress = 1.0 - p
        } else {
            curlProgress = 0
        }
        
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        
        // --- POSITIONS ---
        let floorY = centerPoint.y + baseDimension * 0.6
        let footPos = CGPoint(x: centerPoint.x, y: floorY)
        let kneePos = CGPoint(x: centerPoint.x + baseDimension * 0.03, y: floorY - baseDimension * 0.3)
        let hipPos = CGPoint(x: centerPoint.x, y: floorY - baseDimension * 0.65) // Shorter legs
        let shoulderPos = CGPoint(x: hipPos.x, y: hipPos.y - baseDimension * 0.52) // Shorter torso
        
        let armSegment: CGFloat = baseDimension * 0.38
        
        // --- FIXED UPPER ARM ---
        // Upper arm tilted further forward (right)
        let upperArmAngle: CGFloat = Double.pi * 1.55 
        let elbowPos = CGPoint(
            x: shoulderPos.x + cos(upperArmAngle) * armSegment,
            y: shoulderPos.y - sin(upperArmAngle) * armSegment
        )
        
        // --- FOREARM ROTATION ---
        // Start: -90 deg (down)
        // End: ~54 deg (up towards front shoulder)
        // We use -0.5*pi to 0.3*pi to ensure it sweeps through the FRONT (right side)
        let startAngle: CGFloat = -Double.pi * 0.5
        let endAngle: CGFloat = Double.pi * 0.3 
        
        let currentAngle = startAngle + CGFloat(curlProgress) * (endAngle - startAngle)
        let handPos = CGPoint(
            x: elbowPos.x + cos(currentAngle) * armSegment,
            y: elbowPos.y - sin(currentAngle) * armSegment
        )
        
        // Back Arm (shoulder aligned, arm slightly offset for depth)
        let bShoulder = shoulderPos
        let bElbow = CGPoint(
            x: bShoulder.x + cos(upperArmAngle) * armSegment + 5,
            y: bShoulder.y - sin(upperArmAngle) * armSegment
        )
        let bHand = CGPoint(
            x: bElbow.x + cos(currentAngle) * armSegment + 3,
            y: bElbow.y - sin(currentAngle) * armSegment
        )

        // --- DRAWING ORDER ---
        
        // 0. FAR SIDE DUMBBELL DISC
        let plateR = baseDimension * 0.13 // Smaller for dumbbell
        let plateColor = Color(white: 0.35)
        let depthOffset: CGFloat = 8
        let farPos = CGPoint(x: handPos.x + depthOffset, y: handPos.y)
        let farRect = CGRect(x: farPos.x - plateR, y: farPos.y - plateR, width: plateR*2, height: plateR*2)
        context.fill(Path(ellipseIn: farRect), with: .color(plateColor.opacity(0.6)))
        context.stroke(Path(ellipseIn: farRect), with: .color((colorMode == .darkStickman ? Color.black : Color.white).opacity(0.2)), style: StrokeStyle(lineWidth: 1.5))
        
        // 1. BACK LEG
        var bLegP = Path()
        bLegP.move(to: CGPoint(x: hipPos.x + 4, y: hipPos.y))
        bLegP.addLine(to: CGPoint(x: kneePos.x + 4, y: kneePos.y))
        bLegP.addLine(to: CGPoint(x: footPos.x + 4, y: footPos.y))
        context.stroke(bLegP, with: .color(stickColor.opacity(0.35)), style: StrokeStyle(lineWidth: 13, lineCap: .round, lineJoin: .round))
        
        // 2. BACK ARM
        var bArmP = Path()
        bArmP.move(to: bShoulder)
        bArmP.addLine(to: bElbow)
        bArmP.addLine(to: bHand)
        context.stroke(bArmP, with: .color(stickColor.opacity(0.35)), style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        
        // 3. TORSO
        var torsoP = Path()
        torsoP.move(to: hipPos)
        torsoP.addLine(to: shoulderPos)
        context.stroke(torsoP, with: .color(stickColor), style: StrokeStyle(lineWidth: 13, lineCap: .round))
        
        // 4. HEAD
        let hR: CGFloat = baseDimension * 0.17
        let hPos = CGPoint(x: shoulderPos.x, y: shoulderPos.y - hR * 1.2)
        if isGoatMode {
            let hImg = context.resolve(Image(colorMode == .darkStickman ? "cara13_negro" : "cara13"))
            let hImgSize = hR * 4.4
            var hCtx = context
            hCtx.translateBy(x: hPos.x, y: hPos.y)
            hCtx.draw(hImg, in: CGRect(x: -hImgSize/2, y: -hImgSize/2 + 2, width: hImgSize, height: hImgSize))
        } else {
            context.fill(Path(ellipseIn: CGRect(x: hPos.x - hR, y: hPos.y - hR, width: hR * 2, height: hR * 2)), with: .color(stickColor))
        }
        
        // 5. FRONT LEG
        var fLegP = Path()
        fLegP.move(to: hipPos)
        fLegP.addLine(to: kneePos)
        fLegP.addLine(to: footPos)
        context.stroke(fLegP, with: .color(stickColor), style: StrokeStyle(lineWidth: 13, lineCap: .round, lineJoin: .round))
        
        // 6. FRONT ARM
        var armP = Path()
        armP.move(to: shoulderPos)
        armP.addLine(to: elbowPos)
        armP.addLine(to: handPos)
        context.stroke(armP, with: .color(stickColor), style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        
        // 7. NEAR SIDE DUMBBELL DISC
        let nearRect = CGRect(x: handPos.x - plateR, y: handPos.y - plateR, width: plateR*2, height: plateR*2)
        context.fill(Path(ellipseIn: nearRect), with: .color(plateColor))
        context.stroke(Path(ellipseIn: nearRect), with: .color((colorMode == .darkStickman ? Color.black : Color.white).opacity(0.85)), style: StrokeStyle(lineWidth: 2.5))
        
        let hubR = plateR * 0.6
        context.fill(Path(ellipseIn: CGRect(x: handPos.x - hubR, y: handPos.y - hubR, width: hubR*2, height: hubR*2)), with: .color(Color(white: 0.2)))
        context.stroke(Path(ellipseIn: CGRect(x: handPos.x - hubR, y: handPos.y - hubR, width: hubR*2, height: hubR*2)), with: .color((colorMode == .darkStickman ? Color.black : Color.white).opacity(0.4)), style: StrokeStyle(lineWidth: 1))
        
        context.fill(Path(ellipseIn: CGRect(x: handPos.x - 4, y: handPos.y - 4, width: 8, height: 8)), with: .color(colorMode == .darkStickman ? .black : .white))
        
        // 8. GROUND SHADOW
        let sWidth = baseDimension * 1.2
        context.fill(Path(ellipseIn: CGRect(x: footPos.x - sWidth/2, y: floorY + 5, width: sWidth, height: 10)), with: .color(Color(colorMode == .darkStickman ? Color.black : Color.white).opacity(0.05)))
    }
}

#Preview {
    BicepCurlView()
        .preferredColorScheme(.dark)
}
