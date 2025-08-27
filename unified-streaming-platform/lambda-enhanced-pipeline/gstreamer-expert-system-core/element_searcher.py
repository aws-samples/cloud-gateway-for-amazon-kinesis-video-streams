#!/usr/bin/env python3
"""
Element Searcher
Handles GStreamer element search and documentation functionality
"""

import re
import logging
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

class ElementSearcher:
    """Handles GStreamer element search and documentation"""
    
    def __init__(self, kb_client):
        """Initialize with knowledge base client"""
        self.kb_client = kb_client

    async def search_elements(self, query: str, category: str = "all") -> Dict[str, Any]:
        """
        Search for GStreamer elements by capability, name, or use case
        
        Args:
            query: Search query for elements
            category: Element category filter
            
        Returns:
            Dictionary with search results
        """
        try:
            # Build optimized KB query
            kb_query = self.kb_client.build_kb_query(
                f"gstreamer element {query}",
                mode='elements'
            )
            
            if category != "all":
                kb_query += f" {category}"
            
            # Query knowledge base
            kb_results = await self.kb_client.query_knowledge_base(kb_query, max_results=15)
            
            # Extract and categorize elements
            elements = []
            seen_elements = set()
            
            for result in kb_results:
                content = result.get('content', '')
                score = result.get('score', 0)
                
                # Extract element names from content
                element_names = self._extract_element_names(content)
                
                for element_name in element_names:
                    if element_name not in seen_elements:
                        seen_elements.add(element_name)
                        elements.append({
                            'name': element_name,
                            'description': self._extract_element_description(content, element_name),
                            'category': self._categorize_element(element_name),
                            'relevance_score': score,
                            'source': result.get('source', 'unknown'),
                            'capabilities': self._extract_capabilities(content, element_name)
                        })
            
            # Sort by relevance and limit results
            elements = sorted(elements, key=lambda x: x['relevance_score'], reverse=True)[:10]
            
            return {
                'query': query,
                'category_filter': category,
                'total_found': len(elements),
                'elements': elements,
                'search_successful': True
            }
            
        except Exception as e:
            logger.error(f"Element search failed: {e}")
            return {
                'query': query,
                'error': f"Element search failed: {str(e)}",
                'elements': [],
                'search_successful': False
            }

    async def get_element_docs(self, element_name: str) -> Dict[str, Any]:
        """
        Get detailed documentation for a specific GStreamer element
        
        Args:
            element_name: Name of the GStreamer element
            
        Returns:
            Dictionary with element documentation
        """
        try:
            # Build specific query for this element
            kb_query = self.kb_client.build_kb_query(
                f"gstreamer {element_name} element documentation properties",
                mode='elements'
            )
            
            # Query knowledge base
            kb_results = await self.kb_client.query_knowledge_base(kb_query, max_results=10)
            
            if not kb_results:
                return {
                    'element_name': element_name,
                    'error': f"No documentation found for element: {element_name}",
                    'found': False
                }
            
            # Build comprehensive documentation using Claude
            system_prompt = f"""You are a GStreamer documentation expert. Provide comprehensive documentation for the '{element_name}' element based on the knowledge base information."""
            
            claude_context = self.kb_client.build_claude_context(
                system_prompt,
                kb_results,
                additional_context=f"Focus specifically on the '{element_name}' element. Include:\n1. Element purpose and functionality\n2. Key properties and their descriptions\n3. Usage examples\n4. Common use cases\n5. Platform compatibility\n6. Related elements"
            )
            
            documentation = await self.kb_client.invoke_claude(claude_context)
            
            return {
                'element_name': element_name,
                'documentation': documentation,
                'category': self._categorize_element(element_name),
                'kb_sources': len(kb_results),
                'found': True
            }
            
        except Exception as e:
            logger.error(f"Element documentation retrieval failed: {e}")
            return {
                'element_name': element_name,
                'error': f"Documentation retrieval failed: {str(e)}",
                'found': False
            }

    def _extract_element_names(self, content: str) -> List[str]:
        """Extract GStreamer element names from documentation content"""
        patterns = [
            # Standard element naming patterns
            r'\b\w+(?:src|sink|parse|depay|pay|enc|dec|mux|demux|convert|scale|rate|tee|queue|valve)\b',
            # Elements in pipeline examples
            r'gst-launch-1\.0.*?(\w+(?:src|sink|parse|depay|pay|enc|dec|mux|demux|convert|scale|rate|tee|queue))',
            # Elements in backticks or code blocks
            r'`(\w+(?:src|sink|parse|depay|pay|enc|dec|mux|demux|convert|scale|rate|tee|queue))`',
            # Elements mentioned with "element" keyword
            r'(\w+(?:src|sink|parse|depay|pay|enc|dec|mux|demux|convert|scale|rate|tee|queue))\s+element'
        ]
        
        elements = set()
        for pattern in patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            if isinstance(matches[0], tuple) if matches else False:
                elements.update([match[0] for match in matches])
            else:
                elements.update(matches)
        
        # Filter out common false positives and very short names
        filtered = [
            e for e in elements 
            if len(e) > 3 
            and not e.startswith('gst') 
            and e.lower() not in ['element', 'plugin', 'pipeline']
        ]
        
        return list(filtered)[:10]  # Limit to prevent overwhelming results

    def _extract_element_description(self, content: str, element_name: str) -> str:
        """Extract description for a specific element from content"""
        # Look for sentences containing the element name
        sentences = content.split('.')
        
        for sentence in sentences:
            if element_name.lower() in sentence.lower():
                # Clean up and return the sentence
                description = sentence.strip()
                if len(description) > 20:  # Ensure it's substantial
                    return description[:200] + "..." if len(description) > 200 else description
        
        # Fallback: return first part of content
        return content[:150] + "..." if len(content) > 150 else content

    def _categorize_element(self, element_name: str) -> str:
        """Categorize element by its suffix/purpose"""
        element_lower = element_name.lower()
        
        if element_lower.endswith('src'):
            return 'source'
        elif element_lower.endswith('sink'):
            return 'sink'
        elif element_lower.endswith(('enc', 'encoder')):
            return 'encoder'
        elif element_lower.endswith(('dec', 'decoder')):
            return 'decoder'
        elif element_lower.endswith(('parse', 'parser')):
            return 'parser'
        elif element_lower.endswith(('mux', 'muxer')):
            return 'muxer'
        elif element_lower.endswith(('demux', 'demuxer')):
            return 'demuxer'
        elif element_lower.endswith(('convert', 'converter')):
            return 'converter'
        elif element_lower.endswith('scale'):
            return 'scaler'
        elif element_lower.endswith('rate'):
            return 'rate_controller'
        elif element_lower.endswith(('tee', 'queue', 'valve')):
            return 'utility'
        elif 'pay' in element_lower:
            return 'payloader'
        elif 'depay' in element_lower:
            return 'depayloader'
        else:
            return 'other'

    def _extract_capabilities(self, content: str, element_name: str) -> List[str]:
        """Extract capabilities/features for an element"""
        capabilities = []
        content_lower = content.lower()
        element_lower = element_name.lower()
        
        # Look for capability keywords near the element name
        capability_keywords = [
            'hardware acceleration', 'gpu', 'vaapi', 'nvenc', 'vtenc',
            'h264', 'h265', 'hevc', 'vp8', 'vp9', 'aac', 'opus',
            'rtsp', 'rtp', 'udp', 'tcp', 'multicast',
            'low latency', 'high quality', 'real-time'
        ]
        
        # Find sentences containing the element name
        sentences = content.split('.')
        element_sentences = [s for s in sentences if element_lower in s.lower()]
        
        for sentence in element_sentences:
            sentence_lower = sentence.lower()
            for keyword in capability_keywords:
                if keyword in sentence_lower:
                    capabilities.append(keyword)
        
        return list(set(capabilities))[:5]  # Remove duplicates and limit
