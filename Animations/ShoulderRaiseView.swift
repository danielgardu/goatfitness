import SwiftUI
import Foundation

struct ShoulderRaiseView: View {
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
        let center = CGPoint(x: size.width / 2, y: size.height / 2 + 10)
        let scale = min(size.width, size.height) * 0.42
        
        let rawCycle = timeValue.truncatingRemainder(dividingBy: .pi * 2)
        let phaseProgress = rawCycle / (.pi * 2)
        
        func easeInOut(_ t: Double) -> Double {
            return t < 0.5 ? 2 * t * t : 1 - pow(-2 * t + 2, 2) / 2
        }
        
        var raiseProgress: Double = 0
        if phaseProgress < 0.15 {
            raiseProgress = 0
        } else if phaseProgress < 0.45 {
            raiseProgress = easeInOut((phaseProgress - 0.15) / 0.3)
        } else if phaseProgress < 0.6 {
            raiseProgress = 1.0
        } else if phaseProgress < 0.9 {
            raiseProgress = 1.0 - easeInOut((phaseProgress - 0.6) / 0.3)
        } else {
            raiseProgress = 0
        }
        
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        let lineWidth: CGFloat = 12
        
        // --- BODY POSITIONS ---
        let hips = CGPoint(x: center.x, y: center.y + scale * 0.22)
        let shoulders = CGPoint(x: hips.x, y: hips.y - scale * 0.42)
        let headRad = scale * 0.19 // Match IdleView head radius
        let headPos = CGPoint(x: shoulders.x, y: shoulders.y - headRad * 1.3)
        
        // Standing legs - Slightly less narrow stance
        let footSpan = scale * 0.11
        let footY = center.y + scale * 0.8
        let leftFoot = CGPoint(x: hips.x - footSpan, y: footY)
        let rightFoot = CGPoint(x: hips.x + footSpan, y: footY)
        
        let kneeSpread: CGFloat = scale * 0.015
        let kneeY = hips.y + (footY - hips.y) * 0.58
        let leftKnee = CGPoint(x: (hips.x + leftFoot.x) / 2 - kneeSpread, y: kneeY)
        let rightKnee = CGPoint(x: (hips.x + rightFoot.x) / 2 + kneeSpread, y: kneeY)
        
        // --- DRAWING ---
        
        // 1. LEGS
        var legsPath = Path()
        legsPath.move(to: hips)
        legsPath.addLine(to: leftKnee)
        legsPath.addLine(to: leftFoot)
        legsPath.move(to: hips)
        legsPath.addLine(to: rightKnee)
        legsPath.addLine(to: rightFoot)
        context.stroke(legsPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 12, lineCap: .round))
        
        // 2. TORSO
        var torsoPath = Path()
        torsoPath.move(to: hips)
        torsoPath.addLine(to: shoulders)
        context.stroke(torsoPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 14, lineCap: .round))
        
        // 3. HEAD (Frontal Goat)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "cara9frente_negro" : "cara9frente"))
            let imgSize = headRad * 4.32 // 10% smaller (4.8 * 0.9)
            let rect = CGRect(
                x: headPos.x - imgSize * 0.49, // Maintain 1% right shift (as requested "no hacia la izquierda")
                y: headPos.y - imgSize/2 - (headRad * 0.22) - (imgSize * 0.07), // 5% more up (total 7% up shift)
                width: imgSize,
                height: imgSize
            )
            context.draw(headImage, in: rect)
        } else {
            context.fill(Path(ellipseIn: CGRect(x: headPos.x - headRad, y: headPos.y - headRad, width: headRad * 2, height: headRad * 2)), with: .color(stickColor))
        }
        
        // --- ARMS & DUMBBELLS ---
        let armLen: CGFloat = scale * 0.23 // Shortened arm length to match idle view
        let shoulderSpan = scale * 0.06 // Shoulders very close to torso
        let leftS = CGPoint(x: shoulders.x - shoulderSpan, y: shoulders.y)
        let rightS = CGPoint(x: shoulders.x + shoulderSpan, y: shoulders.y)
        
        // angles in radians
        let downAngle = Double.pi * 0.5
        let horizontalLeftAngle = Double.pi
        let horizontalRightAngle = 0.0
        
        let romLimitDown = 15.0 * .pi / 180.0
        let romLimitUp = 10.0 * .pi / 180.0
        
        // Left Arm: Curve DOWN (subtract from angle to increase Y since Y is down?)
        // Wait, sin(pi - 0.2) is positive. y + sin is DOWN.
        let leftAngle = (downAngle + romLimitDown) + CGFloat(raiseProgress) * (horizontalLeftAngle - downAngle - romLimitDown - romLimitUp)
        let leftElbow = CGPoint(x: leftS.x + cos(leftAngle) * armLen, y: leftS.y + sin(leftAngle) * armLen)
        let leftHand = CGPoint(x: leftElbow.x + cos(leftAngle - 0.18) * armLen, y: leftElbow.y + sin(leftAngle - 0.18) * armLen)
        
        // Right Arm: Curve DOWN
        let rightAngle = (downAngle - romLimitDown) + CGFloat(raiseProgress) * (horizontalRightAngle - downAngle + romLimitDown + romLimitUp)
        let rightElbow = CGPoint(x: rightS.x + cos(rightAngle) * armLen, y: rightS.y + sin(rightAngle) * armLen)
        let rightHand = CGPoint(x: rightElbow.x + cos(rightAngle + 0.18) * armLen, y: rightElbow.y + sin(rightAngle + 0.18) * armLen)
        
        func drawDumbbell(at point: CGPoint, tilt: Double, in ctx: inout GraphicsContext) {
            let plateR = scale * 0.11
            let plateColor = Color(white: 0.35)
            
            var dCtx = ctx
            dCtx.translateBy(x: point.x, y: point.y)
            dCtx.rotate(by: .radians(tilt))
            
            // Background plate
            let backRect = CGRect(x: -plateR - 4, y: -plateR - 1, width: plateR*2, height: plateR*2)
            dCtx.fill(Path(ellipseIn: backRect), with: .color(plateColor.opacity(0.6)))
            
            // Foreground plate
            let frontRect = CGRect(x: -plateR, y: -plateR, width: plateR*2, height: plateR*2)
            dCtx.fill(Path(ellipseIn: frontRect), with: .color(plateColor))
            dCtx.stroke(Path(ellipseIn: frontRect), with: .color((colorMode == .darkStickman ? Color.black : Color.white).opacity(0.8)), style: StrokeStyle(lineWidth: 1.5))
            
            // Hub
            let hubR = plateR * 0.6
            dCtx.fill(Path(ellipseIn: CGRect(x: -hubR, y: -hubR, width: hubR*2, height: hubR*2)), with: .color(Color(white: 0.2)))
            dCtx.stroke(Path(ellipseIn: CGRect(x: -hubR, y: -hubR, width: hubR*2, height: hubR*2)), with: .color((colorMode == .darkStickman ? Color.black : Color.white).opacity(0.3)), style: StrokeStyle(lineWidth: 1))
            
            dCtx.fill(Path(ellipseIn: CGRect(x: -4, y: -4, width: 8, height: 8)), with: .color(colorMode == .darkStickman ? .black : .white))
        }
        
        // Tilt logic: slightly down at the top
        let tiltAmt = 0.4 * raiseProgress
        
        // Draw Left Arm
        var lArmPath = Path()
        lArmPath.move(to: leftS)
        lArmPath.addLine(to: leftElbow)
        lArmPath.addLine(to: leftHand)
        context.stroke(lArmPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 11, lineCap: .round, lineJoin: .round))
        drawDumbbell(at: leftHand, tilt: tiltAmt, in: &context)
        
        // Draw Right Arm
        var rArmPath = Path()
        rArmPath.move(to: rightS)
        rArmPath.addLine(to: rightElbow)
        rArmPath.addLine(to: rightHand)
        context.stroke(rArmPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 11, lineCap: .round, lineJoin: .round))
        drawDumbbell(at: rightHand, tilt: -tiltAmt, in: &context)
        
        // 4. SHADOW
        let sWidth = scale * 1.3
        let shadowRect = CGRect(x: center.x - sWidth/2, y: footY + 10, width: sWidth, height: 10)
        context.fill(Path(ellipseIn: shadowRect), with: .color(Color.black.opacity(0.2)))
    }
}

#Preview {
    ShoulderRaiseView()
        .preferredColorScheme(.dark)
}
