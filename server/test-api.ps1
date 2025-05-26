$loginBody = @{
    username = "admin"
    password = "admin123456"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody

$token = $loginResponse.token
Write-Host "Token: $token"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$skillBody = @{
    name = "React"
    category = "Frontend"
    proficiency = 9
    icon = "react"
} | ConvertTo-Json

$skillResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/skills" -Method POST -Headers $headers -Body $skillBody
$skillResponse | ConvertTo-Json
