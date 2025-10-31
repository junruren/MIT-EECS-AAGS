"""
MIT EECS Education Administration Portal Scraper

This module provides functionality to access and scrape the MIT EECS department's
"who is teaching what" page from the Education Administration Portal.
"""

import re
from typing import Optional, Tuple
import requests
from bs4 import BeautifulSoup
import pandas as pd


def _parse_semester(semester: str) -> Tuple[str, int]:
    """
    Parse a semester string like "Spring 2026" or "Fall 2025".
    
    Args:
        semester: Semester string in format "Season Year" (e.g., "Spring 2026")
        
    Returns:
        Tuple of (season_code, year) where season_code is 'S' or 'F'
        
    Raises:
        ValueError: If semester format is invalid
    """
    match = re.match(r'^(Spring|Fall)\s+(\d{4})$', semester.strip(), re.IGNORECASE)
    if not match:
        raise ValueError(
            f"Invalid semester format: '{semester}'. "
            "Expected format: 'Spring YYYY' or 'Fall YYYY'"
        )
    
    season, year = match.groups()
    season_code = 'S' if season.lower() == 'spring' else 'F'
    return season_code, int(year)


def _build_url(semester: Optional[str] = None) -> str:
    """
    Build the URL for the who_is_teaching_what page.
    
    Args:
        semester: Optional semester string like "Spring 2026" or "Fall 2025"
        
    Returns:
        Complete URL for the page
    """
    base_url = "https://eecseduportal.mit.edu/eduportal/who_is_teaching_what/"
    
    if semester is None:
        return base_url
    
    season_code, year = _parse_semester(semester)
    return f"{base_url}{season_code}/{year}/"


def _extract_semester_from_page(soup: BeautifulSoup) -> str:
    """
    Extract the semester string from the page heading.
    
    Args:
        soup: BeautifulSoup object of the page
        
    Returns:
        Semester string in format "Spring YYYY" or "Fall YYYY"
        
    Raises:
        ValueError: If semester heading cannot be found or parsed
    """
    # Look for table header containing "Courses offered in"
    # The semester info is in a TH tag like "Courses offered in Fall-2025"
    for th in soup.find_all('th'):
        text = th.get_text(strip=True)
        # Extract from text like "Courses offered in Spring-2026"
        match = re.search(r'Courses offered in (Spring|Fall)-(\d{4})', text, re.IGNORECASE)
        if match:
            season, year = match.groups()
            return f"{season.capitalize()} {year}"
    
    # If not found, raise an error
    raise ValueError("Could not find semester information on the page")


def _parse_table(soup: BeautifulSoup) -> pd.DataFrame:
    """
    Parse the who_is_teaching_what table from the page.
    
    Args:
        soup: BeautifulSoup object of the page
        
    Returns:
        DataFrame containing the course information
    """
    # Find the main table
    table = soup.find('table')
    if not table:
        raise ValueError("Could not find course table on the page")
    
    # The table structure has:
    # - First header row: "Courses offered in X" (colspan=3), "Lecturers", "Recitation instructors"
    # - Second row: explanatory notes
    # - Body: actual course data with 5 columns (Area, Course, Title, Lecturers, TAs)
    
    # Define headers based on the known structure
    headers = ['Area', 'Course', 'Title', 'Lecturers', 'TAs']
    
    # Extract data rows
    tbody = table.find('tbody')
    rows = []
    
    if tbody:
        data_rows = tbody.find_all('tr')
        for row in data_rows:
            cells = row.find_all(['td', 'th'])
            if cells and len(cells) >= 3:  # Valid row should have at least 3 cells
                row_data = [cell.get_text(strip=True) for cell in cells]
                # Pad with empty strings if needed
                while len(row_data) < len(headers):
                    row_data.append('')
                # Truncate if too long
                rows.append(row_data[:len(headers)])
    
    # Create DataFrame
    if rows:
        df = pd.DataFrame(rows, columns=headers)
    else:
        df = pd.DataFrame(columns=headers)
    
    return df


def get_who_is_teaching_what(semester: Optional[str] = None) -> Tuple[pd.DataFrame, str]:
    """
    Fetch and parse the "who is teaching what" table from MIT EECS portal.
    
    Args:
        semester: Optional semester string in format "Spring YYYY" or "Fall YYYY".
                 If not provided, fetches the current semester's data.
    
    Returns:
        Tuple of (dataframe, semester_string) where:
        - dataframe: pandas DataFrame containing the course information
        - semester_string: The semester in format "Spring YYYY" or "Fall YYYY"
    
    Raises:
        ValueError: If semester format is invalid or page cannot be parsed
        requests.RequestException: If the HTTP request fails
        
    Example:
        >>> df, semester = get_who_is_teaching_what("Spring 2026")
        >>> print(f"Courses for {semester}")
        >>> print(df.head())
        
        >>> df, semester = get_who_is_teaching_what()  # Current semester
        >>> print(f"Current semester: {semester}")
    """
    # Build URL
    url = _build_url(semester)
    
    # Fetch page
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        raise requests.RequestException(f"Failed to fetch page from {url}: {e}")
    
    # Parse HTML
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Extract semester if not provided
    if semester is None:
        semester = _extract_semester_from_page(soup)
    
    # Parse table
    df = _parse_table(soup)
    
    return df, semester


if __name__ == "__main__":
    # Example usage
    print("Fetching current semester data...")
    df, sem = get_who_is_teaching_what()
    print(f"\nSemester: {sem}")
    print(f"Number of courses: {len(df)}")
    print("\nFirst 5 courses:")
    print(df.head())
    
    print("\n" + "="*80 + "\n")
    
    print("Fetching Spring 2026 data...")
    df_spring, sem_spring = get_who_is_teaching_what("Spring 2026")
    print(f"\nSemester: {sem_spring}")
    print(f"Number of courses: {len(df_spring)}")
    print("\nFirst 5 courses:")
    print(df_spring.head())
