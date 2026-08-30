import SwiftUI
import Foundation

struct BarbellRowView: View {
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
        
        var pullProgress: Double = 0
        
        // 0.0 -> 0.15: Hold at bottom
        // 0.15 -> 0.45: Pulling (Concentric)
        // 0.45 -> 0.60: Squeeze at top
        // 0.60 -> 0.90: Lowering (Eccentric)
        // 0.90 -> 1.00: Reset
        
        if phaseProgress < 0.15 {
            pullProgress = 0
        } else if phaseProgress < 0.45 {
            let p = easeInOut((phaseProgress - 0.15) / 0.3)
            pullProgress = p
        } else if phaseProgress < 0.6 {
            pullProgress = 1.0
        } else if phaseProgress < 0.9 {
            let p = easeInOut((phaseProgress - 0.6) / 0.3)
            pullProgress = 1.0 - p
        } else {
            pullProgress = 0
        }
        
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        
        // --- POSITIONS ---
        // Hip slightly more centered, shoulder raised (rotated left/up)
        let hipPos = CGPoint(x: centerPoint.x - baseDimension * 0.25, y: centerPoint.y - baseDimension * 0.25)
        let shoulderPos = CGPoint(x: hipPos.x + baseDimension * 0.55, y: hipPos.y - baseDimension * 0.1) // Lowered slightly from -0.2
        
        let kneePos = CGPoint(x: hipPos.x + baseDimension * 0.1, y: centerPoint.y - baseDimension * 0.05)
        let footPos = CGPoint(x: kneePos.x - baseDimension * 0.05, y: centerPoint.y + baseDimension * 0.35)
        
        // Rowing limits
        let armSegment: CGFloat = baseDimension * 0.36 // Shorter arms
        
        let startHandY = shoulderPos.y + armSegment * 2.0 // Fully stretched at bottom
        let endHandY = shoulderPos.y + baseDimension * 0.3 // Increased from 0.1 to pull less high
        let startHandX = shoulderPos.x - baseDimension * 0.1
        let endHandX = shoulderPos.x - baseDimension * 0.25
        
        let barX = startHandX + CGFloat(pullProgress) * (endHandX - startHandX)
        let barY = startHandY + CGFloat(pullProgress) * (endHandY - startHandY)
        let handPos = CGPoint(x: barX, y: barY)
        
        func solveIK(shoulder: CGPoint, hand: CGPoint) -> CGPoint {
            let dx = hand.x - shoulder.x
            let dy = hand.y - shoulder.y
            let dist = max(0.1, hypot(dx, dy))
            let targetDist = armSegment * 2
            let clampedDist = min(dist, targetDist - 0.2) // Small margin
            
            let midX = shoulder.x + dx / 2
            let midY = shoulder.y + dy / 2
            let h = sqrt(max(0, armSegment * armSegment - (clampedDist / 2) * (clampedDist / 2)))
            
            // For Barbell Row, elbows point UP and BACK
            let nx = -dy / dist
            let ny = dx / dist
            
            var finalNx = nx
            var finalNy = ny
            
            // Choose the solution that goes "up" (lower Y)
            if finalNy > 0 {
                finalNx = -finalNx
                finalNy = -finalNy
            }
            
            return CGPoint(x: midX + finalNx * h, y: midY + finalNy * h)
        }
        
        // --- 0. FAR SIDE BARBELL DISC (Drawn first) ---
        let plateR = baseDimension * 0.22
        let plateColor = Color(white: 0.35)
        let depthOffset: CGFloat = 8 // Shifted right and closer
        let farPos = CGPoint(x: handPos.x + depthOffset, y: handPos.y - 1)
        let farRect = CGRect(x: farPos.x - plateR, y: farPos.y - plateR, width: plateR*2, height: plateR*2)
        context.fill(Path(ellipseIn: farRect), with: .color(plateColor.opacity(0.6)))
        context.stroke(Path(ellipseIn: farRect), with: .color((colorMode == .darkStickman ? Color.black : Color.white).opacity(0.15)), style: StrokeStyle(lineWidth: 1.5))
        
        // --- 1. LEGS (Back) ---
        let backHip = CGPoint(x: hipPos.x + 4, y: hipPos.y)
        var backLegP = Path()
        backLegP.move(to: backHip)
        backLegP.addLine(to: CGPoint(x: kneePos.x + 4, y: kneePos.y))
        backLegP.addLine(to: CGPoint(x: footPos.x + 4, y: footPos.y))
        context.stroke(backLegP, with: .color(stickColor.opacity(0.35)), style: StrokeStyle(lineWidth: 13, lineCap: .round, lineJoin: .round))
        
        // --- 2. ARM (Back) ---
        let backShoulder = CGPoint(x: shoulderPos.x + 6, y: shoulderPos.y)
        let backHand = CGPoint(x: handPos.x + 6, y: handPos.y)
        let backElbow = solveIK(shoulder: backShoulder, hand: backHand)
        var backArmP = Path()
        backArmP.move(to: backShoulder)
        backArmP.addLine(to: backElbow)
        backArmP.addLine(to: backHand)
        context.stroke(backArmP, with: .color(stickColor.opacity(0.35)), style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        
        // --- 3. TORSO (Fixed straight back) ---
        var torsoP = Path()
        torsoP.move(to: hipPos)
        torsoP.addLine(to: shoulderPos)
        context.stroke(torsoP, with: .color(stickColor), style: StrokeStyle(lineWidth: 13, lineCap: .round))
        
        // --- 4. HEAD ---
        let hR: CGFloat = baseDimension * 0.17
        let headPos = CGPoint(x: shoulderPos.x + hR * 1.0, y: shoulderPos.y - hR * 1.2)
        
        if isGoatMode {
            let hImg = context.resolve(Image(colorMode == .darkStickman ? "cara13_negro" : "cara13"))
            let hImgSize = hR * 4.4
            var hCtx = context
            hCtx.translateBy(x: headPos.x, y: headPos.y)
            hCtx.rotate(by: .degrees(15))
            hCtx.draw(hImg, in: CGRect(x: -hImgSize/2, y: -hImgSize/2, width: hImgSize, height: hImgSize))
        } else {
            context.fill(Path(ellipseIn: CGRect(x: headPos.x - hR, y: headPos.y - hR, width: hR * 2, height: hR * 2)), with: .color(stickColor))
        }
        
        // --- 5. LEGS (Front) ---
        var legP = Path()
        legP.move(to: hipPos)
        legP.addLine(to: kneePos)
        legP.addLine(to: footPos)
        context.stroke(legP, with: .color(stickColor), style: StrokeStyle(lineWidth: 13, lineCap: .round, lineJoin: .round))
        
        // --- 6. ARM (Front) ---
        let frontElbow = solveIK(shoulder: shoulderPos, hand: handPos)
        var armP = Path()
        armP.move(to: shoulderPos)
        armP.addLine(to: frontElbow)
        armP.addLine(to: handPos)
        context.stroke(armP, with: .color(stickColor), style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        
        // --- 7. NEAR SIDE BARBELL DISC ---
        let nearRect = CGRect(x: handPos.x - plateR, y: handPos.y - plateR, width: plateR*2, height: plateR*2)
        context.fill(Path(ellipseIn: nearRect), with: .color(plateColor))
        context.stroke(Path(ellipseIn: nearRect), with: .color((colorMode == .darkStickman ? Color.black : Color.white).opacity(0.85)), style: StrokeStyle(lineWidth: 3))
        
        let hubR = plateR * 0.65
        context.fill(Path(ellipseIn: CGRect(x: handPos.x - hubR, y: handPos.y - hubR, width: hubR*2, height: hubR*2)), with: .color(Color(white: 0.2)))
        context.stroke(Path(ellipseIn: CGRect(x: handPos.x - hubR, y: handPos.y - hubR, width: hubR*2, height: hubR*2)), with: .color((colorMode == .darkStickman ? Color.black : Color.white).opacity(0.4)), style: StrokeStyle(lineWidth: 1))
        
        context.fill(Path(ellipseIn: CGRect(x: handPos.x - 5, y: handPos.y - 5, width: 10, height: 10)), with: .color(colorMode == .darkStickman ? .black : .white))
        
        // --- 8. GROUND SHADOW ---
        let sWidth = baseDimension * 1.4
        let sRect = CGRect(x: footPos.x - sWidth/2, y: footPos.y + 5, width: sWidth, height: 10)
        context.fill(Path(ellipseIn: sRect), with: .color(Color(colorMode == .darkStickman ? Color.black : Color.white).opacity(0.05)))
    }
}

#Preview {
    BarbellRowView()
        .preferredColorScheme(.dark)
}
