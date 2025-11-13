# 📊 Survey Builder Guide

## ✅ Survey Pages Created

### 1. **Survey List Page**
**URL**: http://localhost:3000/surveys
- View all surveys
- Create new surveys
- Navigate to survey details and edit pages

### 2. **Survey Detail Page**
**URL**: http://localhost:3000/surveys/{id}
- View survey details
- See all sections and questions
- View question types and options
- Navigate to edit page

### 3. **Survey Edit/Builder Page**
**URL**: http://localhost:3000/surveys/{id}/edit
- Add sections to survey
- Add questions to sections
- Configure question types
- Set question options
- Delete sections and questions

## 🎯 Question Types Supported

### 1. **Text Input**
- Simple text input field
- For open-ended responses

### 2. **Multiple Choice**
- User can select multiple options
- Requires adding options manually

### 3. **Single Choice**
- User can select one option
- Requires adding options manually

### 4. **Rating (1-5)**
- 5-point rating scale
- Options: 1, 2, 3, 4, 5
- Automatically configured

### 5. **Likert Scale** ⭐
- 5-point agreement scale
- Options: Strongly Disagree, Disagree, Neutral, Agree, Strongly Agree
- Automatically configured
- Perfect for satisfaction surveys

### 6. **Matrix**
- Matrix-style questions
- Requires options configuration

### 7. **Ranking**
- Ranking questions
- Requires options configuration

### 8. **Date**
- Date picker
- For date-based questions

## 📝 How to Build a Survey

### Step 1: Create a Survey
1. Go to http://localhost:3000/surveys
2. Click "Create Survey"
3. Fill in:
   - **Title**: e.g., "Employee Satisfaction Survey"
   - **Description**: e.g., "Annual employee satisfaction survey"
4. Click "Create Survey"

### Step 2: Add Sections
1. Click "Edit" on your survey
2. Click "+ Add New Section"
3. Fill in:
   - **Section Title**: e.g., "Work Environment", "Team Collaboration"
   - **Section Description**: (optional)
4. Click "Add Section"

### Step 3: Add Questions
1. In a section, click "+ Add Question to this Section"
2. Fill in:
   - **Question Text**: e.g., "I am satisfied with my work environment"
   - **Question Type**: Select from dropdown (e.g., "Likert Scale")
   - **Required**: Check if the question is required
3. For Multiple Choice/Single Choice:
   - Click "+ Add Option"
   - Enter option text
   - Add more options as needed
4. Click "Add Question"

### Step 4: View Your Survey
1. Click "Save & View Survey" or navigate to the survey detail page
2. Review all sections and questions
3. Make edits as needed

## 🎨 Example: Creating a Likert Scale Question

1. **Create Section**: "Work Environment"
2. **Add Question**:
   - Question Text: "I am satisfied with my work environment"
   - Question Type: **Likert Scale**
   - Required: ✓ (checked)
3. The Likert scale options are automatically set:
   - Strongly Disagree
   - Disagree
   - Neutral
   - Agree
   - Strongly Agree
4. Click "Add Question"

## 🔧 API Endpoints

### Surveys
- `GET /api/v1/survey/surveys/` - List all surveys
- `POST /api/v1/survey/surveys/` - Create survey
- `GET /api/v1/survey/surveys/{id}/` - Get survey details
- `PUT /api/v1/survey/surveys/{id}/` - Update survey
- `DELETE /api/v1/survey/surveys/{id}/` - Delete survey

### Sections
- `GET /api/v1/survey/sections/` - List all sections
- `POST /api/v1/survey/sections/` - Create section
- `GET /api/v1/survey/sections/{id}/` - Get section
- `PUT /api/v1/survey/sections/{id}/` - Update section
- `DELETE /api/v1/survey/sections/{id}/` - Delete section

### Questions
- `GET /api/v1/survey/questions/` - List all questions
- `POST /api/v1/survey/questions/` - Create question
- `GET /api/v1/survey/questions/{id}/` - Get question
- `PUT /api/v1/survey/questions/{id}/` - Update question
- `DELETE /api/v1/survey/questions/{id}/` - Delete question

## ✅ Features

- ✅ Create surveys with titles and descriptions
- ✅ Add multiple sections to organize questions
- ✅ Add questions with various types
- ✅ Likert scale questions (automatically configured)
- ✅ Rating questions (1-5 scale)
- ✅ Multiple choice and single choice questions
- ✅ Text input questions
- ✅ Date questions
- ✅ Required/optional question marking
- ✅ Delete sections and questions
- ✅ View survey structure
- ✅ Edit survey details

## 🚀 Quick Start

1. **Create a Survey**:
   ```
   http://localhost:3000/surveys
   ```

2. **Edit Survey**:
   ```
   http://localhost:3000/surveys/1/edit
   ```

3. **View Survey**:
   ```
   http://localhost:3000/surveys/1
   ```

## 🎯 Example Survey Structure

```
Employee Satisfaction Survey
├── Section 1: Work Environment
│   ├── Q1: Likert Scale - "I am satisfied with my work environment"
│   ├── Q2: Likert Scale - "I have the resources I need to do my job"
│   └── Q3: Rating - "Rate your work-life balance"
├── Section 2: Team Collaboration
│   ├── Q1: Likert Scale - "I feel supported by my team"
│   └── Q2: Multiple Choice - "What tools do you use for collaboration?"
└── Section 3: Feedback
    └── Q1: Text - "Any additional comments?"
```

## ✅ Status

**All survey builder features are now working!**

- ✅ Survey creation
- ✅ Section management
- ✅ Question creation with Likert scale
- ✅ Multiple question types
- ✅ View and edit pages
- ✅ API integration

---

**Last Updated**: Current
**Status**: ✅ **READY TO USE**

