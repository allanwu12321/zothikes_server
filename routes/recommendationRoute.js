const e = require("express");
const mongoose = require("mongoose");
const User = mongoose.model("Users");
const Trail = mongoose.model("Trails");

function degreeToRadian(degree) {
    return degree * Math.PI / 180;
}

function calculateClosestTrail(lat1, long1, lat2, long2) {
    const lat1R = degreeToRadian(lat1);
    const lat2R = degreeToRadian(lat2);
    const deltaLat = degreeToRadian(lat2 - lat1);
    const deltaLong = degreeToRadian(long2 - long1);

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) + Math.cos(lat1R) * Math.cos(lat2R) * Math.sin(deltaLong/2) * Math.sin(deltaLong/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return 6371000.0 * c  // 6371000 is Earth radius;  result is returned in meters
}


function calculateBmi(weight, height) {
    if (weight != null && height != null) {
        const bmi = (parseFloat(weight) / (parseFloat(height) ** 2)) * 703.0
        console.log(bmi);
        let bmi_result;
        if (bmi < 18.5) {
            bmi_result = "Underweight";
        } else if (bmi < 25) {
            bmi_result = "Normal weight";
        } else if (bmi < 30) {
            bmi_result = "Overweight";
        } else {
            bmi_result = "Obesity";
        }
        return bmi_result;
    }
    return "Error: Please enter a weight and height";
}

async function calculateRecommendation() {
    const trails = await Trail.find({}, function(err, elements) {
        let closest_distance = 9999999;
        // let closest_trail_name;
        let trail_distances = [];
        let trail_scores = [];
        let difficulty_multiplier = 0.0;
        elements.forEach(trail => {
            if (trail.difficulty.localeCompare("easy") == 0) {
                // TODO balance difficulty multiplier
                difficulty_multiplier = 3.0;
            } else if (trail.difficulty.localeCompare("moderate") == 0) {
                difficulty_multiplier = 2.0;
            } else {
                difficulty_multiplier = 1.0;
            }
            let current_distance = calculateClosestTrail(trail.latitude, trail.longitude, 37.422017, -122.0840703);
            trail_distances.push(current_distance);
            trail_scores.push((parseFloat(trail.rating.split(" ")[0])/5.0) * 0.3 + difficulty_multiplier/3.0 * 0.2);
            if (current_distance < closest_distance) {
                closest_distance = current_distance;
                // closest_trail_name = trail.name;
            }
            console.log(calculateClosestTrail(trail.latitude, trail.longitude, 37.422017, -122.0840703), trail.name, trail.rating, (parseFloat(trail.rating.split(" ")[0])/5.0), trail.difficulty);
        });
        console.log(trail_scores);
        for (let i = 0; i < elements.length; i++) {
            trail_scores[i] += 1/(trail_distances[i] / closest_distance) * 0.5;
            
        }
        // console.log(elements[trail_distances.indexOf(closest_distance)].name);
        console.log(trail_distances);
        console.log(trail_scores);
        console.log(elements[trail_scores.indexOf(Math.max(...trail_scores))]);
    });
}

module.exports = (app) => {
    app.get("/api/get_recommendation", async (req, res) => {
        const users = await User.find({}, function(err, elements) {
            elements.forEach(user => {
                console.log(calculateBmi(user.weight, user.height));
                calculateRecommendation();
            });
        });
        console.log(users);

        // console.log(trails);
        
        res.send(calculateBmi(users[0].weight, users[0].height));
        // calculateRecommendation();
        // res.write(users);
        // res.send(users);
    })
};