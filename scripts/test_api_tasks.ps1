
$body = @{
    title = "Test Quiz API"
    courseCode = "CS101"
    type = "Quiz"
    dueDate = (Get-Date).ToString("yyyy-MM-dd")
    description = "Test Description"
    quizQuestions = @(
        @{
            question = "Q1?"
            options = @("A", "B", "C", "D")
            correctAnswer = 0
        }
    )
} | ConvertTo-Json -Depth 5

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/tasks" -Method Post -Body $body -ContentType "application/json"
Write-Host "Created Task ID: $($response.task._id)"
Write-Host "Quiz Questions Len: $($response.task.quizQuestions.Length)"

$taskId = $response.task._id

$getResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/tasks/$taskId" -Method Get
Write-Host "Fetched Task Questions: $($getResponse.task.quizQuestions | ConvertTo-Json -Depth 5)"
