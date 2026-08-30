import SwiftUI
import Foundation

struct BenchPressView: View {
    @Environment(\.animationColorMode) private var colorMode
    @Environment(\.stickmanStaticTime) private var staticTime
    let speed: Double = 1.6
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let timeToUse = staticTime ?? timeline.date.timeIntervalSinceReferenceDate
                self.draw(in: &context, size: size, time: timeToUse)
            }
        }
    }
    
    private func draw(in context: inout GraphicsContext, size: CGSize, time: Double) {
        let timeValue: Double = time * speed
        let centerPoint = CGPoint(x: size.width / 2, y: size.height / 2)
        let baseDimension: CGFloat = min(size.width, size.height) * 0.42
        
        let rawCycle: Double = timeValue.truncatingRemainder(dividingBy: Double.pi * 2)
        let phaseProgress: Double = rawCycle / (Double.pi * 2)
        
        func easeInOut(_ t: Double) -> Double {
            return t < 0.5 ? 2 * t * t : 1 - pow(-2 * t + 2, 2) / 2
        }
        
        var extensionProgress: Double = 0
        var breathingScale: Double = 1.0
        
        if phaseProgress < 0.15 {
            extensionProgress = 1.0
        } else if phaseProgress < 0.5 {
            let p = easeInOut((phaseProgress - 0.15) / 0.35)
            extensionProgress = 1.0 - p
            breathingScale = 1.0 + (p * 0.4)
        } else if phaseProgress < 0.65 {
            extensionProgress = 0.0
            breathingScale = 1.4
        } else if phaseProgress < 0.9 {
            let p = easeInOut((phaseProgress - 0.65) / 0.25)
            extensionProgress = p
            breathingScale = 1.4 - (p * 0.4)
        } else {
            extensionProgress = 1.0
        }
        
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        
        // --- LAYOUT CONSTANTS ---
        let benchTop = centerPoint.y + 15
        let floorY = benchTop + 45
        let benchLength = baseDimension * 1.5
        let padHeight: CGFloat = 11
        
        // --- STICKMAN POSITIONS ---
        let shoulderPos = CGPoint(x: centerPoint.x - baseDimension * 0.22, y: benchTop - 7)
        let hipPos = CGPoint(x: centerPoint.x + baseDimension * 0.38, y: benchTop - 7)
        
        // Barbell trajectory
        let chestX = shoulderPos.x + baseDimension * 0.25
        let chestY = shoulderPos.y - 14
        let extX = shoulderPos.x - baseDimension * 0.05
        let extY = shoulderPos.y - baseDimension * 0.72
        
        let barX = chestX + CGFloat(extensionProgress) * (extX - chestX)
        let barY = chestY + CGFloat(extensionProgress) * (extY - chestY)
        let handPos = CGPoint(x: barX, y: barY)
        
        // --- IK SOLVER ---
        let segmentLen: CGFloat = baseDimension * 0.36
        
        func solveIK(shoulder: CGPoint, hand: CGPoint) -> CGPoint {
            let dx = hand.x - shoulder.x
            let dy = hand.y - shoulder.y
            let dist = max(0.1, hypot(dx, dy))
            let targetDist = segmentLen * 2
            let clampedDist = min(dist, targetDist - 0.1)
            let midX = shoulder.x + dx / 2
            let midY = shoulder.y + dy / 2
            let h = sqrt(max(0, segmentLen * segmentLen - (clampedDist / 2) * (clampedDist / 2)))
            let nx = -dy / dist
            let ny = dx / dist
            var finalNx = nx
            var finalNy = ny
            if finalNx < 0 {
                finalNx = -finalNx
                finalNy = -finalNy
            }
            return CGPoint(x: midX + finalNx * h, y: midY + finalNy * h)
        }
        
        // --- DRAWING ORDER ---
        
        // 0. FAR SIDE BARBELL DISC (Behind everything)
        let plateR = baseDimension * 0.22
        let plateColor = Color(white: 0.35)
        let depthOffset: CGFloat = 8
        let farPos = CGPoint(x: handPos.x + depthOffset, y: handPos.y - 1)
        let farRect = CGRect(x: farPos.x - plateR, y: farPos.y - plateR, width: plateR*2, height: plateR*2)
        context.fill(Path(ellipseIn: farRect), with: .color(plateColor.opacity(0.6)))
        context.stroke(Path(ellipseIn: farRect), with: .color((colorMode == .darkStickman ? Color.black : Color.white).opacity(0.2)), style: StrokeStyle(lineWidth: 2))
        
        // 1. BENCH
        let benchPadRect = CGRect(x: centerPoint.x - benchLength * 0.45, y: benchTop, width: benchLength, height: padHeight)
        context.fill(Path(roundedRect: benchPadRect, cornerRadius: 4), with: .color(stickColor.opacity(0.8)))
        
        let benchLegColor = stickColor.opacity(0.5)
        var benchLegPath = Path()
        benchLegPath.move(to: CGPoint(x: centerPoint.x - benchLength * 0.25, y: benchTop + padHeight))
        benchLegPath.addLine(to: CGPoint(x: centerPoint.x - benchLength * 0.28, y: floorY))
        benchLegPath.move(to: CGPoint(x: centerPoint.x + benchLength * 0.3, y: benchTop + padHeight))
        benchLegPath.addLine(to: CGPoint(x: centerPoint.x + benchLength * 0.33, y: floorY))
        context.stroke(benchLegPath, with: .color(benchLegColor), style: StrokeStyle(lineWidth: 10, lineCap: .round))
        
        // 2. BACK LEG
        let bHip = CGPoint(x: hipPos.x + 4, y: hipPos.y - 2)
        let bKnee = CGPoint(x: bHip.x + baseDimension * 0.2, y: benchTop + 5)
        let bFoot = CGPoint(x: bKnee.x + baseDimension * 0.05, y: floorY - 5)
        var bLegPath = Path()
        bLegPath.move(to: bHip)
        bLegPath.addLine(to: bKnee)
        bLegPath.addLine(to: bFoot)
        context.stroke(bLegPath, with: .color(stickColor.opacity(0.35)), style: StrokeStyle(lineWidth: 13, lineCap: .round, lineJoin: .round))
        
        // 3. BACK ARM
        let bShoulder = CGPoint(x: shoulderPos.x + 8, y: shoulderPos.y - 3)
        let bHand = CGPoint(x: handPos.x + 8, y: handPos.y - 3)
        let bElbow = solveIK(shoulder: bShoulder, hand: bHand)
        var bArmPath = Path()
        bArmPath.move(to: bShoulder)
        bArmPath.addLine(to: bElbow)
        bArmPath.addLine(to: bHand)
        context.stroke(bArmPath, with: .color(stickColor.opacity(0.35)), style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        
        // 4. TORSO
        var torsoP = Path()
        torsoP.move(to: shoulderPos)
        let tPuff = CGFloat(breathingScale - 1.0) * 10
        let tControl = CGPoint(x: (shoulderPos.x + hipPos.x)/2, y: shoulderPos.y - tPuff)
        torsoP.addQuadCurve(to: hipPos, control: tControl)
        context.stroke(torsoP, with: .color(stickColor), style: StrokeStyle(lineWidth: 13, lineCap: .round))
        
        // 5. HEAD
        let hR: CGFloat = baseDimension * 0.17
        let hCenter = CGPoint(x: shoulderPos.x - hR * 1.5, y: benchTop - 7)
        if isGoatMode {
            let hImg = context.resolve(Image(colorMode == .darkStickman ? "cara13_negro" : "cara13"))
            let hImgSize = hR * 4.4
            var hCtx = context
            hCtx.translateBy(x: hCenter.x, y: hCenter.y)
            hCtx.rotate(by: .degrees(-90))
            hCtx.draw(hImg, in: CGRect(x: -hImgSize/2, y: -hImgSize/2 - (hR * 0.1), width: hImgSize, height: hImgSize))
        } else {
            context.fill(Path(ellipseIn: CGRect(x: hCenter.x - hR, y: hCenter.y - hR, width: hR * 2, height: hR * 2)), with: .color(stickColor))
        }
        
        // 6. FRONT LEG
        let fKnee = CGPoint(x: hipPos.x + baseDimension * 0.18, y: benchTop + 8)
        let fFoot = CGPoint(x: fKnee.x + baseDimension * 0.05, y: floorY - 2)
        var fLegP = Path()
        fLegP.move(to: hipPos)
        fLegP.addLine(to: fKnee)
        fLegP.addLine(to: fFoot)
        context.stroke(fLegP, with: .color(stickColor), style: StrokeStyle(lineWidth: 13, lineCap: .round, lineJoin: .round))
        
        // 7. FRONT ARM
        let fElbow = solveIK(shoulder: shoulderPos, hand: handPos)
        var fArmP = Path()
        fArmP.move(to: shoulderPos)
        fArmP.addLine(to: fElbow)
        fArmP.addLine(to: handPos)
        context.stroke(fArmP, with: .color(stickColor), style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))

        // 8. NEAR SIDE BARBELL DISC (In front)
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
    BenchPressView()
        .preferredColorScheme(.dark)
}
