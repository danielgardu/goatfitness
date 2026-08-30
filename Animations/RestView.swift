import SwiftUI
import Foundation

struct RestView: View {
    let speed: Double = 0.5
    var isGoatMode: Bool = false
    @State private var waveStartTime: Double? = nil
    @Environment(\.animationColorMode) private var colorMode
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                self.draw(in: &context, size: size, time: timeline.date.timeIntervalSinceReferenceDate, waveStart: waveStartTime, colorMode: colorMode)
            }
            .contentShape(Rectangle())
            .onTapGesture {
                waveStartTime = Date().timeIntervalSinceReferenceDate
            }
        }
    }
    
    private func draw(in context: inout GraphicsContext, size: CGSize, time: Double, waveStart: Double?, colorMode: AnimationColorMode) {
        let timeValue: Double = time * speed
        let centerPoint = CGPoint(x: size.width / 2, y: size.height / 2 + 10)
        let baseDimension: CGFloat = min(size.width, size.height) * 0.42
        
        let rawCycle: Double = timeValue.truncatingRemainder(dividingBy: Double.pi * 2)
        let phaseProgress: Double = rawCycle / (Double.pi * 2)
        
        let breathingScale = 1.0 + sin(phaseProgress * Double.pi * 2) * 0.05
        let armSway = sin(phaseProgress * Double.pi * 2) * 4.0
        
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        
        // --- LAYOUT CONSTANTS ---
        let benchTop = centerPoint.y + 15
        let floorY = benchTop + 45
        let benchLength = baseDimension * 1.5
        let padHeight: CGFloat = 16
        
        // --- 1. BED ---
        let bedColor = Color(red: 0.8, green: 0.8, blue: 0.8) // Light gray
        let bedPadRect = CGRect(x: centerPoint.x - benchLength * 0.5, y: benchTop, width: benchLength, height: padHeight)
        context.fill(Path(roundedRect: bedPadRect, cornerRadius: 4), with: .color(bedColor.opacity(0.8)))
        
        // Pillow
        let pillowRect = CGRect(x: centerPoint.x - benchLength * 0.5 + 2, y: benchTop - 16, width: baseDimension * 0.35, height: 16)
        context.fill(Path(roundedRect: pillowRect, cornerRadius: 6), with: .color(stickColor.opacity(0.9)))
        
        let bedLegColor = bedColor.opacity(0.5)
        var bedLegPath = Path()
        let leftLegX = centerPoint.x - benchLength * 0.44
        bedLegPath.move(to: CGPoint(x: leftLegX, y: benchTop + padHeight))
        bedLegPath.addLine(to: CGPoint(x: leftLegX, y: floorY))
        
        let rightLegX = centerPoint.x + benchLength * 0.44
        bedLegPath.move(to: CGPoint(x: rightLegX, y: benchTop + padHeight))
        bedLegPath.addLine(to: CGPoint(x: rightLegX, y: floorY))
        context.stroke(bedLegPath, with: .color(bedLegColor), style: StrokeStyle(lineWidth: 10, lineCap: .round))
        
        // --- STICKMAN POSITIONS ---
        let shoulderPos = CGPoint(x: centerPoint.x - baseDimension * 0.29, y: benchTop - 12)
        let hipPos = CGPoint(x: centerPoint.x + baseDimension * 0.21, y: benchTop - 5)
        
        // --- 2. BACK LEG ---
        // Raised slightly, foot on bed
        let bHip = CGPoint(x: hipPos.x + 4, y: hipPos.y - 2)
        let bKnee = CGPoint(x: bHip.x + baseDimension * 0.15, y: benchTop - 20)
        let bFoot = CGPoint(x: bHip.x + baseDimension * 0.35, y: benchTop - 2)
        var bLegPath = Path()
        bLegPath.move(to: bHip)
        bLegPath.addLine(to: bKnee)
        bLegPath.addLine(to: bFoot)
        context.stroke(bLegPath, with: .color(stickColor.opacity(0.7)), style: StrokeStyle(lineWidth: 14, lineCap: .round, lineJoin: .round))
        
        // --- 3. BACK ARM ---
        let bShoulder = CGPoint(x: shoulderPos.x + 8, y: shoulderPos.y + 1)
        var bHand = CGPoint(x: hipPos.x + baseDimension * 0.05, y: benchTop - 23 - CGFloat(armSway * 0.3))
        var bElbow = CGPoint(x: bShoulder.x + baseDimension * 0.15, y: benchTop - 1)
        
        // Waving animation
        if let wStart = waveStart {
            let elapsed = time - wStart
            let duration: Double = 1.8
            if elapsed >= 0 && elapsed <= duration {
                
                var raiseProgress: Double = 0
                if elapsed < 0.3 {
                    raiseProgress = elapsed / 0.3
                } else if elapsed < 1.2 {
                    raiseProgress = 1.0
                } else {
                    raiseProgress = 1.0 - (elapsed - 1.2) / 0.6
                }
                
                let p = raiseProgress < 0.5 ? 2 * raiseProgress * raiseProgress : 1 - pow(-2 * raiseProgress + 2, 2) / 2
                
                var waveAngle: Double = 0
                if elapsed >= 0.3 && elapsed <= 1.2 {
                    let waveTime = (elapsed - 0.3) / 0.9
                    waveAngle = sin(waveTime * Double.pi * 4) * 0.4
                }
                
                let raisedElbow = CGPoint(x: bShoulder.x + baseDimension * 0.05, y: bShoulder.y - baseDimension * 0.15)
                let forearmLen = baseDimension * 0.22
                let baseAngle = -Double.pi * 0.1
                let totalAngle = baseAngle + waveAngle
                let raisedHand = CGPoint(x: raisedElbow.x + sin(totalAngle) * forearmLen, y: raisedElbow.y - cos(totalAngle) * forearmLen)
                
                bElbow.x = bElbow.x + (raisedElbow.x - bElbow.x) * p
                bElbow.y = bElbow.y + (raisedElbow.y - bElbow.y) * p
                bHand.x = bHand.x + (raisedHand.x - bHand.x) * p
                bHand.y = bHand.y + (raisedHand.y - bHand.y) * p
            }
        }
        
        var bArmPath = Path()
        bArmPath.move(to: bShoulder)
        bArmPath.addLine(to: bElbow)
        bArmPath.addLine(to: bHand)
        context.stroke(bArmPath, with: .color(stickColor.opacity(0.7)), style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        
        // --- 4. TORSO ---
        var torsoP = Path()
        torsoP.move(to: shoulderPos)
        let tPuff = CGFloat(breathingScale - 1.0) * 40
        let tControl = CGPoint(x: (shoulderPos.x + hipPos.x)/2, y: (shoulderPos.y + hipPos.y)/2 - tPuff)
        torsoP.addQuadCurve(to: hipPos, control: tControl)
        context.stroke(torsoP, with: .color(stickColor), style: StrokeStyle(lineWidth: 14, lineCap: .round))
        
        // --- 5. HEAD ---
        let hR: CGFloat = baseDimension * 0.17
        let hCenter = CGPoint(x: shoulderPos.x - hR * 1.2, y: benchTop - 22) // Head on pillow
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
        
        // --- 6. FRONT LEG ---
        // Lying on bed
        let fKnee = CGPoint(x: hipPos.x + baseDimension * 0.2, y: benchTop - 4)
        let fFoot = CGPoint(x: fKnee.x + baseDimension * 0.25, y: benchTop - 2)
        var fLegP = Path()
        fLegP.move(to: hipPos)
        fLegP.addLine(to: fKnee)
        fLegP.addLine(to: fFoot)
        context.stroke(fLegP, with: .color(stickColor), style: StrokeStyle(lineWidth: 14, lineCap: .round, lineJoin: .round))
        
        // --- 7. FRONT ARM ---
        // Falling off bed
        let fElbow = CGPoint(x: shoulderPos.x - baseDimension * 0.05, y: benchTop + 10)
        let fHand = CGPoint(x: fElbow.x + baseDimension * 0.08 + CGFloat(armSway), y: fElbow.y + baseDimension * 0.2)
        var fArmP = Path()
        fArmP.move(to: shoulderPos)
        fArmP.addLine(to: fElbow)
        fArmP.addLine(to: fHand)
        context.stroke(fArmP, with: .color(stickColor), style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
    }
}

#Preview {
    RestView()
        .preferredColorScheme(.dark)
}
