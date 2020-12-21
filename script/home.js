$(document).ready(function() {
    var questions = [];
    var category = '';
    var difficulty = '';

    var quizContainer = document.getElementById('quiz');
    var resultContainer = document.getElementById('result');

    var loggedInUser = sessionStorage.getItem('LoggedInUser');
    loggedInUser = JSON.parse(loggedInUser);

    $('h1').text(`Logged In as ${loggedInUser.firstName} ${loggedInUser.lastName}`);

    $('#logout').click(function(e) {
        sessionStorage.removeItem('LoggedInUser');
        location.href= './index.html';
    })

    $('#start').click(LoadQuiz);

    function LoadQuiz() {
        questions = [];
        resultContainer.innerHTML = '';
        document.getElementById('noquiz').innerHTML = '';
        $('#loader').show();

        var apiURL = 'https://opentdb.com/api.php?amount=10&type=multiple';

        category = $('#categories').val();
        difficulty = $('#difficulty').val();

        if(category != 'any') {
            apiURL = apiURL.concat(`&category=${category}`)
        }
        
        if(difficulty != 'any') {
            apiURL = apiURL.concat(`&difficulty=${difficulty}`)
        }

        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var response = JSON.parse(this.response);
                if(response.results && response.results.length > 0) {
                    createQuiz(response.results);
                    bindAnswersEvent();
                } else {
                    console.log(questions);
                    $('#loader').hide();
                    $('#submitQuiz').hide();
                    quizContainer.innerHTML = '';
                    document.getElementById('noquiz').innerHTML = 'No quiz found! Choose another';
                }
            }
        };
        xhttp.open("GET", apiURL, true);
        xhttp.send();
    }

    function createQuiz(list) {
        try{
            
            quizContainer.innerHTML = '';
    
            for(var i=0; i < list.length; i++) {
                var item = list[i];
    
                item.incorrect_answers.push(item.correct_answer);
                var choices = randomizeArray(item.incorrect_answers);
                questions.push({
                    id: i,
                    question: item.question,
                    incorrectAnswers: choices,
                    correctAnswer: item.correct_answer,
                    mark: 0
                });
    
                var p = document.createElement("p");
                var node = document.createTextNode(item.question);
                p.appendChild(node);
    
                quizContainer.appendChild(p);
    
                var ul = document.createElement('ul');
                choices.forEach((ans, index) => {
                    var name = `${i}`;
                    const li = document.createElement('li');
                    li.innerHTML = `<input type="radio" name=${name} value="${ans}">${ans}`;
    
                    ul.appendChild(li);
    
                    quizContainer.appendChild(ul);                    
                });
            }
            
        }
        catch(ex) {
            console.log('Something went wrong. Try again.');
        }
        finally {
            $('#loader').hide();
        }
    }

    function bindAnswersEvent () {
        $('input[type=radio]').change(function() {
            var index = questions.findIndex(q => q.id == Number(this.name))
            if(questions[index].correctAnswer == this.value) {
                questions[index].mark = 1;
            }
        })
        $('#submitQuiz').show();
        $('#submitQuiz').click(function() {
            var total = 0;

            questions.forEach(question => {
                total = total + question.mark;
            }); 

            showResult(total);
        })
    }

    function randomizeArray(array){
        for (let i = array.length-1; i >=0; i--) {
         
            let randomIndex = Math.floor(Math.random()*(i+1)); 
            let itemAtIndex = array[randomIndex]; 
             
            array[randomIndex] = array[i]; 
            array[i] = itemAtIndex;
        }
        return array;
    }

    function showResult(total) {
        quizContainer.innerHTML = '';
        $('#submitQuiz').hide();
        var remark = '';
        if(total <= 4) {
            remark = 'Better Luck Next Time!';
        } else if (total >= 5 && total <= 7) {
            remark = 'Well Done!';
        } else {
            remark = 'Excellent!';
        }
        resultContainer.innerHTML  = `<p><span>${remark}</span> You scored ${total} out of 10.<h4>Play Again!</h4>`;
        saveUserResults(total);
    }

    function saveUserResults(total) {
        var users = localStorage.getItem('Users');
        users = JSON.parse(users);
        var index = users.findIndex(u => u.email == loggedInUser.email);
        
        users[index].grading.push({
            grade: total,
            category: category,
            level: difficulty,
            submittedOn: new Date()
        })

        localStorage.setItem('Users', JSON.stringify(users));
    }
})