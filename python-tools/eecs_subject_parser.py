"""
MIT EECS Subject Number Parser

This module provides functions to parse and normalize EECS subject numbers
that may mix new and old numbering systems.

Starting Fall 2022, EECS transitioned from 3-digit (6.xxx) to 4-digit (6.yyyy)
subject numbering. Some systems display combo formats like "6.1220J[6.046]"
where the new number appears outside brackets and old number inside.

This module extracts the new-format subject numbers and handles expansion
of multiple subjects (e.g., "6.1000/A/B" → ["6.1000", "6.100A", "6.100B"]).
"""

import re
from typing import List


def parse_subject_number(subject_string: str) -> List[str]:
    """
    Parse an EECS subject number string that may contain new/old numbering mix.

    The function handles various formats and always returns a list of strings:
    - Combo format: "6.1220J[6.046]" → ["6.1220J"]
    - Multiple subjects: "6.1000/A/B[6.0001+2]" → ["6.1000", "6.100A", "6.100B"]
    - Simple new format: "6.0001" → ["6.0001"]
    - Lettered subjects: "6.UAR" → ["6.UAR"]

    Args:
        subject_string: The subject number string to parse

    Returns:
        List[str]: List of parsed subject number strings (always a list, even for single subjects)

    Examples:
        >>> parse_subject_number("6.1220J[6.046]")
        ['6.1220J']

        >>> parse_subject_number("6.1000/A/B[6.0001+2]")
        ['6.1000', '6.100A', '6.100B']

        >>> parse_subject_number("6.UAR")
        ['6.UAR']

        >>> parse_subject_number("6.0001")
        ['6.0001']
    """
    if not subject_string or not subject_string.strip():
        raise ValueError("Subject string cannot be empty")

    subject_string = subject_string.strip()

    # Step 1: Extract the new number portion (before brackets if present)
    # Handle combo format like "6.1220J[6.046]" → extract "6.1220J"
    if '[' in subject_string and ']' in subject_string:
        # Find the position of the opening bracket
        bracket_start = subject_string.find('[')
        new_number_part = subject_string[:bracket_start].strip()
    else:
        new_number_part = subject_string

    # Step 2: Check for slash notation indicating multiple subjects
    # Handle formats like "6.1000/A/B" → ["6.1000", "6.100A", "6.100B"]
    if '/' in new_number_part:
        return _expand_multiple_subjects(new_number_part)
    else:
        return [new_number_part]


def _expand_multiple_subjects(subject_part: str) -> List[str]:
    """
    Expand a subject number with slash notation into individual subjects.

    Examples:
        "6.1000/A/B" → ["6.1000", "6.100A", "6.100B"]
        "6.3450/A" → ["6.3450", "6.345A"]
        "6.1000" → ["6.1000"] (no expansion needed)

    Args:
        subject_part: The subject number part that may contain slash notation

    Returns:
        List[str]: List of expanded subject numbers
    """
    # Split on '/' to get base and suffixes
    parts = subject_part.split('/')

    if len(parts) == 1:
        # No slash notation, return as single item list
        return [subject_part]

    # First part is the base number
    base = parts[0].strip()

    # Remaining parts are suffixes to append
    subjects = [base]  # Start with the base number

    for suffix in parts[1:]:
        suffix = suffix.strip()
        if suffix:
            subjects.append(f"{base[:-1]}{suffix}")  # Replace last char with suffix

    return subjects


def is_new_format(subject_number: str) -> bool:
    """
    Check if a subject number is in the new 4-digit format.

    New format: 4 digits after decimal (6.yyyy)
    Old format: 3 digits after decimal (6.xxx)
    Lettered subjects: unchanged (6.UAR, 6.UAT, etc.)

    Args:
        subject_number: The subject number to check

    Returns:
        bool: True if in new format, False otherwise

    Examples:
        >>> is_new_format("6.1220")
        True

        >>> is_new_format("6.046")
        False

        >>> is_new_format("6.UAR")
        True  # Lettered subjects are considered "new format" (unchanged)
    """
    # Lettered subjects (no digits after decimal) are unchanged
    if not re.search(r'\d', subject_number.split('.')[1] if '.' in subject_number else ''):
        return True

    # Extract digits after decimal
    match = re.match(r'^\d+\.(\d+)', subject_number)
    if not match:
        return False

    digits_after_decimal = len(match.group(1))
    return digits_after_decimal == 4


def normalize_subject_number(subject_string: str) -> List[str]:
    """
    Convenience function that parses and validates subject numbers.

    This is a wrapper around parse_subject_number() that also performs
    basic validation on the result.

    Args:
        subject_string: The subject number string to normalize

    Returns:
        List[str]: Normalized subject number(s) (always a list)

    Raises:
        ValueError: If parsing results in invalid subject numbers
    """
    result = parse_subject_number(subject_string)

    # Basic validation
    def validate_single_subject(subject: str) -> bool:
        """Validate a single subject number format."""
        if not subject or not subject.strip():
            return False
        # Should start with digit(s).digit(s) or digit(s).letter(s)
        return bool(re.match(r'^\d+\.[\d\w]+$', subject.strip()))

    # Result is always a list now
    for subject in result:
        if not validate_single_subject(subject):
            raise ValueError(f"Invalid subject number format in result: '{subject}'")
    return result


if __name__ == "__main__":
    # Example usage and testing
    test_cases = [
        "6.1220J[6.046]",
        "6.1000/A/B[6.0001+2]",
        "6.UAR",
        "6.0001",
        "6.3450/A",
        "6.036[6.036]",  # Same old and new
    ]

    print("EECS Subject Number Parser - Test Cases")
    print("=" * 50)

    for test_case in test_cases:
        try:
            result = parse_subject_number(test_case)
            print(f"Input:  '{test_case}'")
            print(f"Output: {result}")
            print()
        except Exception as e:
            print(f"Input:  '{test_case}'")
            print(f"Error:  {e}")
            print()