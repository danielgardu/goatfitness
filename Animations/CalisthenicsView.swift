import SwiftUI

struct CalisthenicsView: View {
    @Environment(\.animationColorMode) private var colorMode
    let speed: Double = 1.2
    var isGoatMode: Bool = false
    
    var body: some View {
        GoatTimelineView { timeline in
            Canvas { (context: inout GraphicsContext, size: CGSize) in
                let t = timeline.date.timeIntervalSinceReferenceDate * speed
                self.drawCalisthenics(in: &context, size: size, time: t)
            }
        }
    }
    
    private func drawCalisthenics(in context: inout GraphicsContext, size: CGSize, time t: Double) {
        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let scale = min(size.width, size.height) * 0.42
        
        let stickColor: Color = colorMode == .darkStickman ? .black : .white
        
        // --- TIMING ---
        let cycle = t.truncatingRemainder(dividingBy: .pi * 2)
        let p = cycle / (.pi * 2)
        
        let liftProgress: CGFloat
        if p < 0.3 {
            liftProgress = sin((p / 0.3) * (.pi / 2))
        } else if p < 0.4 {
            liftProgress = 1.0
        } else if p < 0.8 {
            let tp = (p - 0.4) / 0.4
            liftProgress = 1.0 - (tp * tp * (3 - 2 * tp))
        } else {
            liftProgress = 0.0
        }
        
        // --- SETUP FOR PULL-UP ---
        let barY = center.y - scale * 0.7
        let barWidth = scale * 1.6
        let barLeft = center.x - barWidth / 2
        let barRight = center.x + barWidth / 2
        
        let gripSpread = scale * 0.55
        let handL = CGPoint(x: center.x - gripSpread / 2, y: barY)
        let handR = CGPoint(x: center.x + gripSpread / 2, y: barY)
        
        // --- BODY DYNAMICS ---
        let hangNeckY = barY + scale * 0.65
        let pullNeckY = barY + scale * 0.05
        let neckY = hangNeckY + (pullNeckY - hangNeckY) * liftProgress
        
        let sway: CGFloat = 0.0
        let neckPos = CGPoint(x: center.x + sway, y: neckY)
        
        let torsoLen = scale * 0.42
        let hipPos = CGPoint(x: center.x + sway * 1.5, y: neckPos.y + torsoLen)
        
        let headRad = scale * 0.14
        let headPos = CGPoint(x: neckPos.x, y: neckPos.y - headRad * 1.25)
        
        let upperArmLen = scale * 0.28
        let forearmLen = scale * 0.28
        
        func getElbow(shoulder: CGPoint, hand: CGPoint, isLeft: Bool) -> CGPoint {
            let dx = hand.x - shoulder.x
            let dy = hand.y - shoulder.y
            let dist = sqrt(dx*dx + dy*dy)
            
            if dist >= upperArmLen + forearmLen {
                let ratio = upperArmLen / (upperArmLen + forearmLen)
                return CGPoint(x: shoulder.x + dx * ratio, y: shoulder.y + dy * ratio)
            }
            
            let a = upperArmLen
            let b = forearmLen
            let c = dist
            let cosAngle = ((a*a) + (c*c) - (b*b)) / (2 * a * c)
            let angle = acos(max(-1.0, min(1.0, cosAngle)))
            let baseAngle = atan2(dy, dx)
            let elbowAngle = isLeft ? baseAngle - angle : baseAngle + angle
            
            return CGPoint(x: shoulder.x + cos(elbowAngle) * a, y: shoulder.y + sin(elbowAngle) * a)
        }
        
        let elbowL = getElbow(shoulder: neckPos, hand: handL, isLeft: true)
        let elbowR = getElbow(shoulder: neckPos, hand: handR, isLeft: false)
        
        let thighLen = scale * 0.30
        let shinLen = scale * 0.30
        let legAngle = .pi / 2 - 0.02 - liftProgress * 0.05
        let legSpread = scale * 0.05 - liftProgress * 0.04 
        
        let hOffsetThigh = cos(legAngle) * thighLen
        let vOffsetThigh = sin(legAngle) * thighLen
        let kneeL = CGPoint(x: hipPos.x - legSpread - hOffsetThigh, y: hipPos.y + vOffsetThigh)
        let kneeR = CGPoint(x: hipPos.x + legSpread + hOffsetThigh, y: hipPos.y + vOffsetThigh)
        
        let shinAngle = legAngle + 0.05 
        let hOffsetShin = cos(shinAngle) * shinLen
        let vOffsetShin = sin(shinAngle) * shinLen
        let footL = CGPoint(x: kneeL.x - hOffsetShin, y: kneeL.y + vOffsetShin)
        let footR = CGPoint(x: kneeR.x + hOffsetShin, y: kneeR.y + vOffsetShin)
        
        // --- DRAWING ---
        
        
        // Torso
        var torsoPath = Path()
        torsoPath.move(to: neckPos)
        torsoPath.addLine(to: hipPos)
        context.stroke(torsoPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 13, lineCap: .round))
        
        // Legs
        var legsPath = Path()
        legsPath.move(to: hipPos); legsPath.addLine(to: kneeL); legsPath.addLine(to: footL)
        legsPath.move(to: hipPos); legsPath.addLine(to: kneeR); legsPath.addLine(to: footR)
        context.stroke(legsPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 12, lineCap: .round, lineJoin: .round))
        
        // Arms
        var armsPath = Path()
        armsPath.move(to: neckPos); armsPath.addLine(to: elbowL); armsPath.addLine(to: handL)
        armsPath.move(to: neckPos); armsPath.addLine(to: elbowR); armsPath.addLine(to: handR)
        context.stroke(armsPath, with: .color(stickColor), style: StrokeStyle(lineWidth: 10, lineCap: .round, lineJoin: .round))
        
        // Head (Goat Mode Support - Calisthenics uses cara9frente.png)
        if isGoatMode {
            let headImage = context.resolve(Image(colorMode == .darkStickman ? "carafrenteespejo_negro" : "carafrenteespejo"))
            let imgSize = headRad * 5.1788 // 10% larger than previous
            let rect = CGRect(
                x: headPos.x - imgSize * 0.5, // 5% left shift from current (now centered)
                y: headPos.y - imgSize/2 - (headRad * 0.26) - (imgSize * 0.05), // 5% more up
                width: imgSize,
                height: imgSize
            )
            context.draw(headImage, in: rect)
        } else {
            context.fill(Path(ellipseIn: CGRect(x: headPos.x - headRad, y: headPos.y - headRad, width: headRad*2, height: headRad*2)), with: .color(stickColor))
        }
        
        // Pull-up Bar (Moved to front and changed to orange)
        var barPath = Path()
        barPath.move(to: CGPoint(x: barLeft, y: barY))
        barPath.addLine(to: CGPoint(x: barRight, y: barY))
        context.stroke(barPath, with: .color(.orange), style: StrokeStyle(lineWidth: 12, lineCap: .round))
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        CalisthenicsView()
            .frame(width: 300, height: 300)
    }
}
