import { defineStore } from "pinia";


export const useMainStore = defineStore("main", {
	state: () => ({
		userProfile: {
			name: "Jacob Anderson",
			age: 24,
			interests: [
				"Music",
				"Programming",
				"Chess",
				"Playing Piano",
				"Hardware Design",
				"Mentoring Others",
			],
			about: "My name is Jacob Anderson, I am from Georgia and absolutely love music! I have a passion for programming and hardware design, and I enjoy mentoring others and contributing to projects with practical outcomes.",
			education: [
				{
					degree: "Bachelor of Computer Engineering, Minor: Computer Science",
					institution: "Brigham Young University, Provo, UT",
					description: "Current GPA: 3.78, August 2020 to Present",
				},
				{
					degree: "Dual Enrollment",
					institution: "Georgia State University",
					description: "GPA 3.52, Aug 2017 to May 2018",
				},
			],
			work: [
				{
					role: "Undergraduate Research Assistant",
					company: "Brigham Young University",
					description: "Assisted in developing a non-invasive glucose device with Dr. Chiang and Dr. Davis, focusing on system integration and data analysis. Sep 2022 to Present",
				},
				{
					role: "Private Instructor and Instructor Success Trainer (IST)",
					company: "Juni Learning",
					description: "Taught youth (7-18) programming, math, and science 1-on-1, with a focus on real-world applications. May 2021 to April 2024",
				},
				{
					role: "Full-Time Service Volunteer",
					company: "The Church of Jesus Christ of Latter-day Saints, Ecuador",
					description: "Held leadership/manager positions over 12 volunteers, coordinating efforts and providing training. July 2018 to Apr 2020",
				},
				{
					role: "Programmer and Assistant",
					company: "AudioT",
					description: "Worked for the start-up AudioT, programming Raspberry Pi’s using Python and Bash. May 2020 to August 2020",
				},
				{
					role: "Web Designer",
					company: "Freelance",
					description: "Developed and maintained websites using HTML, CSS, JavaScript, and Vue for various clients. July 2020 to June 2021",
				},
			],
			skills: [
				"Fluent in Spanish – Reading and Writing proficiency Moderate to High",
				"Programming – C, C++, Java, TypeScript, Python, System Verilog, HTML, CSS, JavaScript (moderate fluency), Scratch, RISC-V Assembly, React, and Vue",
				"Hardware Design – System Integration, Circuit Design, Data Analysis",
				"Mentorship – Teaching programming, math, and science to youth and peers",
			],
			achievements: [
				"Rank of Eagle Scout in the BSA organization",
				"Phi Eta Sigma Honor Society Member",
				"Contributor to a non-invasive glucose monitoring device research project",
			],
			otherActivities: [
				"Study Abroad at Georgia Tech Lorraine in Metz, France, Winter semesters of 2015 and 2016",
				"First Lego League Robotics Team 2011 to 2014",
				"Shakespeare Tavern of Atlanta, Volunteer",
				"Community service involvement, including Project Read in Provo",
			],
			experience: [
				{
					role: "Research Assistant",
					location: "BYU",
					description: "Assisting in research for developing a non-invasive glucose monitoring device, with a focus on system integration and data analysis.",
				},
				{
					role: "Employee",
					location: "Chick-Fil-A",
					description: "Worked at Chick-Fil-A, gaining experience in customer service and teamwork.",
				},
				{
					role: "Employee",
					location: "Crumbl",
					description: "Worked at Crumbl over the summer, focusing on customer service and product preparation.",
				},
				{
					role: "Web Developer",
					location: "Freelance",
					description: "Developed websites for clients, including a basic website for my Dad using HTML and CSS.",
				},
				{
					role: "Web Developer",
					location: "Startup",
					description: "Worked on web development for a startup initiated by one of my dad's students, contributing to the growth of the project.",
				},
			],
			projects: [
				{
					name: "Website for Dad",
					description: "Developed a basic website for my Dad using HTML and CSS.",
				},
				{
					name: "Student Startup Website",
					description: "Developed and maintained a website for a startup initiated by one of my dad's students.",
				},
				{
					name: "Eagle Project",
					description: "Created an orienteering course for my Eagle Scout project, contributing to community development.",
				},
			],
		},
	}),
	
	// Define actions for fetching or mutating the state
	actions: {
		// Example: Fetch user profile data from an API
		fetchUserProfile() {
			// Implementation for fetching user profile data
		},
	},
	
	// Define getters to compute derived state or access specific parts of the state
	getters: {
		// Example getter for getting all project names
		projectNames: state => state.userProfile.projects.map(project => project.name),
	},
});
